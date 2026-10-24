"""
compute_accuracy.py
Calculates model accuracy on the 20% hold-out test set using the exact prediction logic as app.py.
Saves results into fasal_backend/accuracy_stats.json.
DO NOT RETRAIN the model.
"""
import os
import re
import json
import warnings
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split

import sys
warnings.filterwarnings("ignore")

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "crop_model.pkl")
COLUMNS_PATH = os.path.join(BASE_DIR, "model_columns.pkl")
DATA_PATH = os.path.join(BASE_DIR, "crop_production.csv.zip")
OUTPUT_STATS_PATH = os.path.join(BASE_DIR, "accuracy_stats.json")

PREDICT_YEARS = list(range(2009, 2015))
TONNES_PER_UNIT = {"cotton(lint)": 0.17, "jute": 0.18, "mesta": 0.18}


def norm(s):
    return re.sub(r"[^a-z0-9&()/]", "", str(s).lower())


def main():
    print(f"Loading model from: {MODEL_PATH}")
    model = joblib.load(MODEL_PATH)
    columns = joblib.load(COLUMNS_PATH)
    col_index = {c: i for i, c in enumerate(columns)}

    print(f"Loading data from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    for c in ["State_Name", "District_Name", "Season", "Crop"]:
        df[c] = df[c].astype(str).str.strip()
    df = df.dropna(subset=["Production"]).drop_duplicates()
    df = df[(df["Area"] > 0) & (df["Production"] > 0)].copy()

    df["factor"] = df["Crop"].map(lambda c: TONNES_PER_UNIT.get(norm(c), 1.0))
    df["Prod_t"] = df["Production"] * df["factor"]

    crops_in_data = {norm(c): c for c in df["Crop"].unique()}
    crop_aliases = {
        "wheat": ["wheat"], "rice": ["rice"], "maize": ["maize"],
        "cotton": ["cotton(lint)", "cotton"], "sugarcane": ["sugarcane"],
        "mustard": ["rapeseed&mustard", "mustard"], "chickpea": ["gram"],
        "potato": ["potato"], "bajra": ["bajra"], "jowar": ["jowar"],
        "ragi": ["ragi"], "barley": ["barley"], "arhar": ["arhar/tur", "tur", "arhar"],
        "moong": ["moong(greengram)", "moong"], "urad": ["urad"], "masoor": ["masoor"],
        "peas": ["peas&beans(pulses)", "peas"], "groundnut": ["groundnut"],
        "soybean": ["soyabean", "soybean"], "sunflower": ["sunflower"],
        "sesame": ["sesamum"], "jute": ["jute"], "onion": ["onion"],
    }
    crop_id_to_dataset = {}
    for cid, names in crop_aliases.items():
        for n in names:
            if norm(n) in crops_in_data:
                crop_id_to_dataset[cid] = crops_in_data[norm(n)]
                break

    supported_crops = set(crop_id_to_dataset.values())

    print("Splitting train/test (80/20, random_state=42)...")
    train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)
    test_rows = test_df[test_df["Crop"].isin(supported_crops)]
    print(f"Test rows with supported crops: {len(test_rows)}")

    # Precompute historical district/state/national stats as used by app.py fallback chain
    print("Precomputing historical aggregations...")
    g_dist = df.groupby(["State_Name", "District_Name", "Crop"])
    dist_avg = (g_dist["Prod_t"].sum() / g_dist["Area"].sum()).to_dict()
    dist_med = g_dist["Area"].median().to_dict()

    # Outlier fallback in app.py uses recent 5 years (< 2015)
    recent_df = df[df["Crop_Year"] < 2015]
    recent_years = recent_df[["State_Name", "District_Name", "Crop", "Crop_Year"]].drop_duplicates().copy()
    recent_years["year_rank"] = recent_years.groupby(["State_Name", "District_Name", "Crop"])["Crop_Year"].rank(method="dense", ascending=False)
    last5_years = recent_years[recent_years["year_rank"] <= 5]
    recent_5_df = recent_df.merge(last5_years[["State_Name", "District_Name", "Crop", "Crop_Year"]], on=["State_Name", "District_Name", "Crop", "Crop_Year"])
    g_rec = recent_5_df.groupby(["State_Name", "District_Name", "Crop"])
    rec_avg = (g_rec["Prod_t"].sum() / g_rec["Area"].sum()).to_dict()

    g_state = df.groupby(["State_Name", "Crop"])
    state_avg = (g_state["Prod_t"].sum() / g_state["Area"].sum()).to_dict()
    state_med = g_state["Area"].median().to_dict()

    g_india = df.groupby("Crop")
    india_avg = (g_india["Prod_t"].sum() / g_india["Area"].sum()).to_dict()
    india_med = g_india["Area"].median().to_dict()

    unique_combos = test_rows[["State_Name", "District_Name", "Season", "Crop"]].drop_duplicates().values
    n_combos = len(unique_combos)
    print(f"Building feature matrix for {n_combos} unique test combinations across {len(PREDICT_YEARS)} years...")

    X_all = np.zeros((n_combos * len(PREDICT_YEARS), len(columns)), dtype=np.float32)
    combo_meta = []

    for idx, (state, district, season, crop_ds) in enumerate(unique_combos):
        k_dist = (state, district, crop_ds)
        if k_dist in dist_avg and not np.isnan(dist_avg[k_dist]):
            avg = dist_avg[k_dist]
            area_ref = dist_med[k_dist]
            level = "district"
            r_avg = rec_avg.get(k_dist)
        elif (state, crop_ds) in state_avg and not np.isnan(state_avg[(state, crop_ds)]):
            avg = state_avg[(state, crop_ds)]
            area_ref = state_med[(state, crop_ds)]
            level = "state"
            r_avg = None
        else:
            avg = india_avg[crop_ds]
            area_ref = india_med[crop_ds]
            level = "india"
            r_avg = None

        combo_meta.append((state, district, season, crop_ds, area_ref, avg, level, r_avg))

        base_row = idx * len(PREDICT_YEARS)
        for i, yr in enumerate(PREDICT_YEARS):
            r = base_row + i
            X_all[r, col_index["Crop_Year"]] = yr
            X_all[r, col_index["Area"]] = area_ref
            for prefix, val in (("State_Name_", state), ("District_Name_", district),
                                ("Season_", season), ("Crop_", crop_ds)):
                if val and (prefix + val) in col_index:
                    X_all[r, col_index[prefix + val]] = 1

    print("Running model prediction...")
    all_preds = model.predict(X_all)

    print("Processing yield estimates with app.py outlier fallback...")
    pred_cache = {}
    for idx, (state, district, season, crop_ds, area_ref, avg, level, r_avg) in enumerate(combo_meta):
        base_row = idx * len(PREDICT_YEARS)
        factor = TONNES_PER_UNIT.get(norm(crop_ds), 1.0)
        to_yield = lambda lg: float(np.expm1(lg) * factor / area_ref)

        means_per_yr = all_preds[base_row : base_row + len(PREDICT_YEARS)]
        y_mids = [to_yield(lg) for lg in means_per_yr]
        y_mid = float(np.median(y_mids))
        avg_val = avg or y_mid
        ratio = y_mid / avg_val if avg_val else 1.0

        # Outlier fallback exactly as in app.py
        if level == "district" and district and (ratio < 0.5 or ratio > 2.0) and r_avg is not None and not np.isnan(r_avg):
            y_mid = r_avg

        pred_cache[(state, district, season, crop_ds)] = y_mid

    print("Comparing predictions against actual test set yields...")
    y_trues = (test_rows["Prod_t"] / test_rows["Area"]).values
    y_preds = np.array([pred_cache[(r.State_Name, r.District_Name, r.Season, r.Crop)] for r in test_rows.itertuples()])

    apes = np.abs(y_preds - y_trues) / y_trues * 100.0

    med_err = float(np.median(apes))
    w25 = float(np.mean(apes <= 25.0) * 100.0)
    w50 = float(np.mean(apes <= 50.0) * 100.0)
    n_rows = int(len(apes))

    stats = {
        "median_abs_pct_error": round(med_err, 1),
        "within_25_pct": round(w25, 1),
        "within_50_pct": round(w50, 1),
        "rows_evaluated": n_rows,
        "note": "random 20% hold-out par naapa gaya, naye saalon par error zyada ho sakta hai"
    }

    print("\n--- RESULTS ---")
    print(f"Median Absolute % Error: {stats['median_abs_pct_error']}%")
    print(f"Predictions within 25%: {stats['within_25_pct']}%")
    print(f"Predictions within 50%: {stats['within_50_pct']}%")
    print(f"Total Rows Evaluated:   {stats['rows_evaluated']}")
    print(f"Note:                   {stats['note']}")

    with open(OUTPUT_STATS_PATH, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)

    print(f"\nSaved stats to {OUTPUT_STATS_PATH}")
    return stats


if __name__ == "__main__":
    main()
