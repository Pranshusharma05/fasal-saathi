"""
Fasal Saathi - Flask backend
Model (crop_model.pkl) ko UI se jodta hai.

Is folder mein ye 4 files honi chahiye:
  crop_model.pkl, model_columns.pkl, crop_production.csv.zip (original dataset)
"""
import os
import re
import difflib
import warnings

import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

warnings.filterwarnings("ignore")

BASE = os.path.dirname(os.path.abspath(__file__))
PREDICT_YEAR = 2014          # dataset 1997-2015 hai; 2015 adhoora hai, isliye 2014
ACRE_TO_HA = 0.4047

# Kuch crops ka Production tonnes mein nahi hota (bales mein hota hai)
TONNES_PER_UNIT = {"cotton(lint)": 0.17, "jute": 0.18, "mesta": 0.18}

SEASON_MAP = {
    "kharif": "Kharif", "rabi": "Rabi", "zaid": "Summer",
    "annual": "Whole Year", "autumn": "Autumn", "winter": "Winter",
}

# UI crop id -> dataset mein jo naam ho sakte hain
CROP_ALIASES = {
    "wheat": ["wheat"], "rice": ["rice"], "maize": ["maize"],
    "cotton": ["cotton(lint)", "cotton"], "sugarcane": ["sugarcane"],
    "mustard": ["rapeseed&mustard", "mustard"], "chickpea": ["gram"],
    "potato": ["potato"], "bajra": ["bajra"], "jowar": ["jowar"],
    "ragi": ["ragi"], "barley": ["barley"], "arhar": ["arhar/tur", "tur", "arhar"],
    "moong": ["moong(greengram)", "moong"], "urad": ["urad"], "masoor": ["masoor"],
    "peas": ["peas&beans(pulses)", "peas"], "groundnut": ["groundnut"],
    "soybean": ["soyabean", "soybean"], "sunflower": ["sunflower"],
    "sesame": ["sesamum"], "jute": ["jute"], "tea": ["tea"], "coffee": ["coffee"],
    "onion": ["onion"], "tomato": ["tomato"], "banana": ["banana"], "mango": ["mango"],
}

STATE_ALIASES = {"dadranagarhaveliandamandandiu": "dadraandnagarhaveli"}


def norm(s):
    return re.sub(r"[^a-z0-9&()/]", "", str(s).lower())


# ---------- Model aur data load ----------
model = joblib.load(os.path.join(BASE, "crop_model.pkl"))
columns = joblib.load(os.path.join(BASE, "model_columns.pkl"))
col_index = {c: i for i, c in enumerate(columns)}

df = pd.read_csv(os.path.join(BASE, "crop_production.csv.zip"))
for c in ["State_Name", "District_Name", "Season", "Crop"]:
    df[c] = df[c].astype(str).str.strip()
df = df.dropna(subset=["Production"]).drop_duplicates()
df = df[(df["Area"] > 0) & (df["Production"] > 0)].copy()
df["factor"] = df["Crop"].map(lambda c: TONNES_PER_UNIT.get(norm(c), 1.0))
df["Prod_t"] = df["Production"] * df["factor"]

STATES = {norm(s): s for s in df["State_Name"].unique()}
CROPS = {norm(c): c for c in df["Crop"].unique()}
DISTRICTS_BY_STATE = {s: {norm(d): d for d in g["District_Name"].unique()}
                      for s, g in df.groupby("State_Name")}

CROP_ID_TO_DATASET = {}
for cid, names in CROP_ALIASES.items():
    for n in names:
        if norm(n) in CROPS:
            CROP_ID_TO_DATASET[cid] = CROPS[norm(n)]
            break


def fuzzy(key, pool, cutoff):
    key = STATE_ALIASES.get(key, key)
    if key in pool:
        return pool[key]
    m = difflib.get_close_matches(key, list(pool.keys()), n=1, cutoff=cutoff)
    return pool[m[0]] if m else None


def hist_yield(mask):
    sub = df[mask]
    if len(sub) == 0:
        return None, 0
    return float(sub["Prod_t"].sum() / sub["Area"].sum()), len(sub)


def build_row(state, district, season, crop, area_ha):
    x = np.zeros((1, len(columns)), dtype=np.float32)
    x[0, col_index["Crop_Year"]] = PREDICT_YEAR
    x[0, col_index["Area"]] = area_ha
    for prefix, val in (("State_Name_", state), ("District_Name_", district),
                        ("Season_", season), ("Crop_", crop)):
        if val and (prefix + val) in col_index:
            x[0, col_index[prefix + val]] = 1
    return x


app = Flask(__name__)
CORS(app)


@app.get("/api/health")
def health():
    return jsonify(status="ok", rows=len(df), crops_supported=sorted(CROP_ID_TO_DATASET))


@app.post("/api/predict")
def predict():
    body = request.get_json(force=True)

    # ---- 1. Input saaf karo ----
    crop_ds = CROP_ID_TO_DATASET.get(body.get("crop"))
    if not crop_ds:
        return jsonify(error="crop_not_supported",
                       message="इस फसल का डेटा उपलब्ध नहीं है / No data for this crop"), 422
    state = fuzzy(norm(body.get("state", "")), STATES, 0.8)
    if not state:
        return jsonify(error="state_not_found",
                       message="इस राज्य का डेटा उपलब्ध नहीं है / No data for this state"), 422
    district = fuzzy(norm(body.get("district", "")), DISTRICTS_BY_STATE[state], 0.75)

    try:
        area = float(body.get("area", 0))
    except (TypeError, ValueError):
        area = 0
    if area <= 0:
        return jsonify(error="bad_area", message="क्षेत्रफल सही नहीं है / Invalid area"), 400
    area_ha = area * ACRE_TO_HA if body.get("unit", "acre") == "acre" else area

    season = SEASON_MAP.get(body.get("season"), "Kharif")
    reasons, advice = [], []

    # Agar is crop ko is season mein kabhi ugaya hi nahi gaya, to uska sabse common season lo
    seen = df[df["Crop"] == crop_ds]["Season"]
    if season not in set(seen):
        season_used = seen.value_counts().index[0]
        reasons.append({"impact": "neutral",
                        "text_hi": f"इस फसल का डेटा चुने हुए मौसम में नहीं मिला, {season_used} मौसम का उपयोग हुआ",
                        "text_en": f"No data for this crop in the chosen season; used {season_used} instead"})
        season = season_used

    # ---- 3. Ziley ka historical average + typical area (fallback chain) ----
    chain = []
    if district:
        chain.append((df["State_Name"].eq(state) & df["District_Name"].eq(district) & df["Crop"].eq(crop_ds), "district"))
    chain += [(df["State_Name"].eq(state) & df["Crop"].eq(crop_ds), "state"),
              (df["Crop"].eq(crop_ds), "india")]
    avg, n, level, area_ref = None, 0, "india", None
    for mask, lvl in chain:
        avg, n = hist_yield(mask)
        if avg:
            level = lvl
            area_ref = float(df[mask]["Area"].median())
            break
    area_ref = area_ref or area_ha

    # ---- 2. Prediction ----
    # Dataset ziley-level ka hai (bade area), isliye model ko us ziley-crop ke
    # typical (median) area par chalate hain, phir yield = production / area.
    x = build_row(state, district, season, crop_ds, area_ref)
    factor = TONNES_PER_UNIT.get(norm(crop_ds), 1.0)
    tree_preds = np.array([t.predict(x)[0] for t in model.estimators_])
    to_yield = lambda lg: float(np.expm1(lg) * factor / area_ref)
    y_mid = to_yield(tree_preds.mean())
    y_lo, y_hi = to_yield(np.percentile(tree_preds, 10)), to_yield(np.percentile(tree_preds, 90))
    avg = avg or y_mid

    # ---- 4. Reasons (sirf data se, koi nakli mausam nahi) ----
    ratio = y_mid / avg if avg else 1
    pct = abs(round((ratio - 1) * 100))
    if ratio >= 1.05:
        reasons.append({"impact": "positive", "text_hi": f"अनुमानित पैदावार ज़िले के औसत से लगभग {pct}% ज़्यादा है",
                        "text_en": f"Predicted yield is about {pct}% above the historical average"})
    elif ratio <= 0.95:
        reasons.append({"impact": "negative", "text_hi": f"अनुमानित पैदावार ज़िले के औसत से लगभग {pct}% कम है",
                        "text_en": f"Predicted yield is about {pct}% below the historical average"})
    else:
        reasons.append({"impact": "neutral", "text_hi": "अनुमानित पैदावार ज़िले के औसत के आसपास है",
                        "text_en": "Predicted yield is close to the historical average"})

    trend_mask = df["State_Name"].eq(state) & df["Crop"].eq(crop_ds)
    if district:
        trend_mask &= df["District_Name"].eq(district)
    old, _ = hist_yield(trend_mask & (df["Crop_Year"] <= 2008))
    new, _ = hist_yield(trend_mask & (df["Crop_Year"] >= 2009))
    if old and new:
        ch = (new / old - 1) * 100
        if ch > 5:
            reasons.append({"impact": "positive", "text_hi": f"पिछले सालों में इस फसल की पैदावार लगभग {round(ch)}% बढ़ी है",
                            "text_en": f"Yield for this crop has grown ~{round(ch)}% in recent years"})
        elif ch < -5:
            reasons.append({"impact": "negative", "text_hi": f"पिछले सालों में इस फसल की पैदावार लगभग {round(-ch)}% घटी है",
                            "text_en": f"Yield for this crop has fallen ~{round(-ch)}% in recent years"})

    if level == "district" and district:
        reasons.append({"impact": "neutral", "text_hi": f"यह अनुमान इस ज़िले के {n} ऐतिहासिक रिकॉर्ड पर आधारित है",
                        "text_en": f"Based on {n} historical records from this district"})
    else:
        reasons.append({"impact": "negative", "text_hi": "इस ज़िले का डेटा कम है, राज्य/देश के औसत का उपयोग हुआ",
                        "text_en": "Limited district data; state/national average was used"})

    # ---- 5. Advice ----
    if ratio < 0.9:
        advice.append({"text_hi": "फसल बीमा (PMFBY) और नुकसान की सूचना समय पर दर्ज कराएं",
                       "text_en": "File PMFBY crop insurance / damage report on time"})
    advice += [
        {"text_hi": "सिंचाई समय पर करें और मिट्टी की नमी की जाँच करते रहें",
         "text_en": "Irrigate on time and keep checking soil moisture"},
        {"text_hi": "मिट्टी की जाँच (Soil Test) करवाएँ और संतुलित खाद दें",
         "text_en": "Get a soil test done and use balanced fertilizer"},
        {"text_hi": "बेहतर सलाह के लिए नज़दीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें",
         "text_en": "Consult your nearest KVK for localized advice"},
    ]

    # ---- 6. Confidence ----
    spread = (y_hi - y_lo) / y_mid if y_mid else 9
    if level == "district" and n >= 8 and spread < 0.6:
        conf = "high"
    elif level in ("district", "state") and n >= 3:
        conf = "medium"
    else:
        conf = "low"

    return jsonify(
        yield_t_ha=round(y_mid, 2),
        range_low_t_ha=round(min(y_lo, y_mid), 2),
        range_high_t_ha=round(max(y_hi, y_mid), 2),
        district_avg_t_ha=round(avg, 2),
        confidence=conf,
        soil_source="district_average",
        reasons=reasons[:3],
        advice=advice[:3],
    )


if __name__ == "__main__":
    print("Supported crops:", sorted(CROP_ID_TO_DATASET))
    print("Missing in dataset:", sorted(set(CROP_ALIASES) - set(CROP_ID_TO_DATASET)))
    app.run(host="127.0.0.1", port=5000, debug=False)
