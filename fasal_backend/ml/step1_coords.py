"""
Step 1: District Coordinates Resolver for Fasal Saathi
Resolves lat/lon for all unique (State_Name, District_Name) in crop_production.csv.zip
using GeoJSON centroids as preferred method, falling back to Open-Meteo Geocoding API.
"""
import os
import re
import sys
import json
import time
import urllib.parse
import requests
import pandas as pd
from tqdm import tqdm

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(BASE_DIR)
DATASET_PATH = os.path.join(BACKEND_DIR, "crop_production.csv.zip")
OUTPUT_COORDS_CSV = os.path.join(BASE_DIR, "district_coords.csv")
OUTPUT_UNMATCHED_CSV = os.path.join(BASE_DIR, "unmatched_districts.csv")
GEOJSON_CACHE = os.path.join(BASE_DIR, "india_district_centroids.json")
GEOCODE_CACHE = os.path.join(BASE_DIR, "geocoding_cache.json")

def norm(s):
    return re.sub(r"[^a-z0-9]", "", str(s).lower())

# State name normalizations
STATE_NAME_MAP = {
    "andamanandnicobar": "andamanandnicobarislands",
    "jammuandkashmir": "jammuandkashmir",
    "dadraandnagarhaveli": "dadraandnagarhaveliandamandiu",
}

# Comprehensive mapping of alternate district names, split districts, and administrative HQs
DISTRICT_ALIASES = {
    # Andaman & Nicobar
    "nicobars": ["car nicobar", "nicobar"],
    "northandmiddleandaman": ["mayabunder", "rangat", "north and middle andaman"],
    "southandamans": ["port blair", "south andaman"],
    # Andhra Pradesh
    "kadapa": ["cuddapah", "kadapa"],
    "spsrnellore": ["nellore", "sri potti sriramulu nellore"],
    "visakhapatanam": ["visakhapatnam"],
    # Arunachal Pradesh
    "anjaw": ["hawai", "anjaw"],
    "dibangvalley": ["anini", "dibang valley"],
    "kurungkumey": ["koloriang"],
    "kraadaadi": ["palin"],
    "lowersibansiri": ["ziro", "lower subansiri"],
    "uppersibansiri": ["daporijo", "upper subansiri"],
    "westkameng": ["bomdila", "west kameng"],
    "eastkameng": ["seppa", "east kameng"],
    "papumpare": ["yupia", "itanagar"],
    "upperdibangvalley": ["anini"],
    # Assam
    "baksa": ["mushalpur", "baksa"],
    "chirang": ["kajalgaon", "chirang"],
    "dimahasao": ["haflong", "north cachar hills"],
    "kamrupmetro": ["guwahati", "kamrup metropolitan"],
    "sivasagar": ["sibsagar", "sivasagar"],
    "marigaon": ["morigaon"],
    # Bihar
    "pashchimchamparan": ["bettiah", "west champaran"],
    "purbichamparan": ["motihari", "east champaran"],
    "kaimurbhabua": ["bhabua", "kaimur"],
    "sheohar": ["sheohar"],
    "lakhisarai": ["lakhisarai"],
    "sheikhpura": ["sheikhpura"],
    # Chhattisgarh
    "dakshinbastardantewada": ["dantewada"],
    "uttarbastarkanker": ["kanker"],
    "kabirdham": ["kawardha", "kabirdham"],
    "balod": ["balod"],
    "balodabazar": ["baloda bazar"],
    "balrampur": ["balrampur"],
    "bemetara": ["bemetara"],
    "gariyaband": ["gariaband"],
    "kondagaon": ["kondagaon"],
    "mungeli": ["mungeli"],
    "sukma": ["sukma"],
    "surajpur": ["surajpur"],
    # Gujarat
    "ahmadabad": ["ahmedabad"],
    "banaskantha": ["palanpur", "banaskantha"],
    "sabarkantha": ["himatnagar", "sabarkantha"],
    "panchmahals": ["godhra", "panchmahal"],
    "dohad": ["dahod"],
    "thedangs": ["ahwa", "dang"],
    "chhotaudepur": ["chhota udaipur"],
    "devbhumidwarka": ["khambhalia", "dwarka"],
    "girsomnath": ["veraval", "somnath"],
    "morbi": ["morbi"],
    "mahisagar": ["lunawada"],
    # Haryana
    "mewat": ["nuh", "mewat"],
    "palwal": ["palwal"],
    # Himachal Pradesh
    "lahulandspiti": ["keylong", "lahaul and spiti"],
    # Jammu & Kashmir
    "badgam": ["budgam"],
    "baramula": ["baramulla"],
    "punch": ["poonch"],
    "shupiyan": ["shopian"],
    "bandipore": ["bandipora"],
    "lehladdakh": ["leh", "ladakh"],
    "kargil": ["kargil"],
    "ganderbal": ["ganderbal"],
    "kulgam": ["kulgam"],
    "ramban": ["ramban"],
    "reasi": ["reasi"],
    "samba": ["samba"],
    "kishtwar": ["kishtwar"],
    # Jharkhand
    "khunti": ["khunti"],
    "ramgarh": ["ramgarh"],
    "saraikelakharsawan": ["seraikela", "saraikela kharsawan"],
    "simdega": ["simdega"],
    "latehar": ["latehar"],
    "jamtara": ["jamtara"],
    # Karnataka
    "bagalkot": ["bagalkote"],
    "belgaum": ["belagavi"],
    "bellary": ["ballari"],
    "bijapur": ["vijayapura"],
    "chamarajanagar": ["chamarajanagara"],
    "chikmagalur": ["chikkamagaluru"],
    "davangere": ["davanagere"],
    "gulbarga": ["kalaburagi"],
    "mysore": ["mysuru"],
    "shimoga": ["shivamogga"],
    "tumkur": ["tumakuru"],
    "ramanagara": ["ramanagara"],
    "yadgir": ["yadgir"],
    # Madhya Pradesh
    "alirajpur": ["alirajpur"],
    "singrauli": ["waidhan", "singrauli"],
    "anuppur": ["anuppur"],
    "ashoknagar": ["ashok nagar"],
    "burhanpur": ["burhanpur"],
    "agar malwa": ["agar"],
    # Maharashtra
    "mumbaicity": ["mumbai"],
    "mumbaisuburban": ["bandra", "mumbai suburban"],
    "palghar": ["palghar"],
    # Punjab
    "firozpur": ["ferozepur"],
    "muktsar": ["sri muktsar sahib", "muktsar"],
    "nawanshahr": ["shahid bhagat singh nagar", "nawanshahr"],
    "fazilka": ["fazilka"],
    "pathankot": ["pathankot"],
    "sasnagar": ["mohali", "sahibzada ajit singh nagar"],
    "barnala": ["barnala"],
    "tarantaran": ["tarn taran"],
    # Rajasthan
    "pratapgarh": ["pratapgarh"],
    # Tamil Nadu
    "ariyalur": ["ariyalur"],
    "tiruppur": ["tirupur"],
    "krishnagiri": ["krishnagiri"],
    # Telangana
    "yadadribhuvanagiri": ["bhongir", "yadadri"],
    # Uttar Pradesh
    "allahabad": ["prayagraj", "allahabad"],
    "faizabad": ["ayodhya", "faizabad"],
    "amethi": ["gauriganj", "amethi", "chhatrapati shahuji maharaj nagar"],
    "hapur": ["hapur", "panchsheel nagar"],
    "hathras": ["hathras", "mahamaya nagar"],
    "kasganj": ["kasganj", "kashiram nagar"],
    "sambhal": ["sambhal", "bhim nagar"],
    "shamli": ["shamli", "prabuddh nagar"],
    "kanpurdehat": ["akbarpur", "kanpur dehat", "ramabai nagar"],
    "santkabeernagar": ["khalilabad", "sant kabir nagar"],
    "santravidasnagar": ["bhadohi", "sant ravidas nagar"],
    "siddharthnagar": ["navgarh", "siddharthnagar"],
    "kushinagar": ["padrauna", "kushinagar"],
    "jyotibaphulenagar": ["amroha", "jyotiba phule nagar"],
    # Uttarakhand
    "garhwal": ["pauri", "pauri garhwal"],
    # West Bengal
    "barddhaman": ["burdwan", "bardhaman"],
    "coochbehar": ["cooch behar", "koch bihar"],
    "kochbihar": ["cooch behar", "koch bihar"],
    "darjiling": ["darjeeling"],
    "haora": ["howrah"],
    "hugli": ["hooghly", "chinsurah"],
    "maldah": ["malda", "english bazar"],
    "medinipureast": ["tamluk", "purba medinipur"],
    "medinipurwest": ["midnapore", "paschim medinipur"],
    "north24parganas": ["barasat", "north 24 parganas"],
    "south24parganas": ["alipore", "south 24 parganas"],
    "purulya": ["purulia"],
    "alipurduar": ["alipurduar"],
    "kalimpong": ["kalimpong"],
    "jhargram": ["jhargram"],
    "dinajpurdakshin": ["balurghat", "dakshin dinajpur"],
    "dinajpuruttar": ["raiganj", "uttar dinajpur"],
    # Odisha
    "angul": ["anugul", "angul"],
    "baleshwar": ["balasore", "baleshwar"],
    "baudh": ["boudh", "baudh"],
    "debagarh": ["deogarh", "debagarh"],
    "jajapur": ["jajpur", "jajapur"],
    "nabarangapur": ["nabarangpur", "nabarangapur"],
    "subarnapur": ["sonepur", "subarnapur"],
    "kendujhar": ["keonjhar", "kendujhar"],
    "jagatsinghapur": ["jagatsinghpur"],
    "khandhamal": ["phulbani", "kandhamal"],
    # Additional 37 districts
    "chirang": ["kajalgaon", "bongaigaon"],
    "dang": ["ahwa", "the dangs"],
    "tapi": ["vyara"],
    "bandipora": ["sumbal", "bandipore"],
    "baramulla": ["baramula"],
    "lehladakh": ["leh"],
    "eastsinghbum": ["jamshedpur", "purba singhbhum"],
    "sahebganj": ["sahibganj"],
    "westsinghbhum": ["chaibasa", "pashchimi singhbhum"],
    "bengaluruurban": ["bangalore", "bengaluru"],
    "chikballapur": ["chintamani", "chikkaballapura"],
    "ramanagara": ["channapatna", "ramanagar"],
    "uttarkannad": ["uttara kannada", "karwar"],
    "agarmalwa": ["agar"],
    "buldhana": ["buldana"],
    "raigad": ["alibag", "raigarh"],
    "imphaleast": ["imphal", "porompat", "imphal east"],
    "imphalwest": ["lamphelpat", "imphal"],
    "eastjaintiahills": ["khliehriat"],
    "northgarohills": ["resubelpara"],
    "southwestgarohills": ["ampati"],
    "southwestkhasihills": ["mawkyrwat"],
    "westjaintiahills": ["jowai"],
    "anugul": ["angul"],
    "firozepur": ["firozpur"],
    "eastdistrict": ["gangtok"],
    "northdistrict": ["mangan"],
    "southdistrict": ["namchi"],
    "westdistrict": ["gyalshing"],
    "thenilgiris": ["udhagamandalam", "ooty", "nilgiris"],
    "gomati": ["udaipur", "gomati"],
    "sepahijala": ["bishramganj", "sephaijala"],
    "unakoti": ["kailashahar"],
    "kanpurnagar": ["kanpur"],
    "udamsinghnagar": ["udham singh nagar", "rudrapur"],
    "24paraganasnorth": ["barasat", "north 24 parganas"],
    "24paraganassouth": ["alipore", "south 24 parganas"],
}

session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0 FasalSaathi/1.0"})

def load_geocoding_cache():
    if os.path.exists(GEOCODE_CACHE):
        try:
            with open(GEOCODE_CACHE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_geocoding_cache(cache):
    with open(GEOCODE_CACHE, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2)

def geocode_open_meteo(query, state_name, cache):
    cache_key = f"{norm(query)}__{norm(state_name)}"
    if cache_key in cache:
        return cache[cache_key]

    url = f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(query)}&country_code=IN&count=10&language=en&format=json"
    try:
        r = session.get(url, timeout=4)
        if r.status_code == 200:
            data = r.json()
            results = [item for item in data.get("results", []) if item.get("country_code") == "IN"]
            norm_state = norm(state_name)
            for item in results:
                admin1 = norm(item.get("admin1", ""))
                if admin1 == norm_state or norm_state in admin1 or admin1 in norm_state:
                    hit = [item["latitude"], item["longitude"], item.get("name"), item.get("admin1")]
                    cache[cache_key] = hit
                    return hit
            if results and len(results) == 1:
                hit = [results[0]["latitude"], results[0]["longitude"], results[0].get("name"), results[0].get("admin1")]
                cache[cache_key] = hit
                return hit
    except Exception:
        pass

    cache[cache_key] = None
    return None

def main():
    print("Loading crop production dataset...", flush=True)
    df = pd.read_csv(DATASET_PATH)
    pairs = df[["State_Name", "District_Name"]].drop_duplicates().sort_values(["State_Name", "District_Name"])
    print(f"Total unique (State_Name, District_Name) pairs: {len(pairs)}", flush=True)

    with open(GEOJSON_CACHE, "r", encoding="utf-8") as f:
        centroids = json.load(f)
    print(f"Loaded {len(centroids)} GeoJSON boundary centroids.", flush=True)

    cache = load_geocoding_cache()
    print(f"Loaded {len(cache)} cached geocoding results.", flush=True)

    results = []
    unmatched = []

    pbar = tqdm(pairs.iterrows(), total=len(pairs), desc="Resolving coordinates")
    for idx, row in pbar:
        st = str(row["State_Name"]).strip()
        dt = str(row["District_Name"]).strip()
        nst = norm(st)
        ndt = norm(dt)

        # 1. Preferred: Direct GeoJSON centroid match
        match_key = f"{nst}__{ndt}"
        if match_key in centroids:
            lat, lon = centroids[match_key]
            results.append({"state": st, "district": dt, "lat": lat, "lon": lon, "match_method": "geojson_centroid"})
            continue

        # 1b. GeoJSON centroid with alias
        alias_list = DISTRICT_ALIASES.get(ndt, [])
        geo_matched = False
        for alt in alias_list:
            alt_key = f"{nst}__{norm(alt)}"
            if alt_key in centroids:
                lat, lon = centroids[alt_key]
                results.append({"state": st, "district": dt, "lat": lat, "lon": lon, "match_method": "geojson_centroid_alias"})
                geo_matched = True
                break
            elif norm(alt) in centroids:
                lat, lon = centroids[norm(alt)]
                results.append({"state": st, "district": dt, "lat": lat, "lon": lon, "match_method": "geojson_centroid_alias"})
                geo_matched = True
                break
        if geo_matched:
            continue

        # 1c. GeoJSON by district name alone
        if ndt in centroids:
            lat, lon = centroids[ndt]
            results.append({"state": st, "district": dt, "lat": lat, "lon": lon, "match_method": "geojson_district_centroid"})
            continue

        # 2. Fallback: Open-Meteo Geocoding API
        candidates = [dt]
        clean_dt = re.sub(r"\(.*?\)", "", dt).strip()
        if clean_dt != dt:
            candidates.append(clean_dt)
        paren_words = re.findall(r"\((.*?)\)", dt)
        if paren_words:
            candidates.append(paren_words[0].strip())
        candidates.extend(alias_list)

        hit = None
        for cand in candidates:
            hit = geocode_open_meteo(cand, st, cache)
            if hit:
                break

        if hit:
            lat, lon, res_name, res_admin = hit
            results.append({"state": st, "district": dt, "lat": round(lat, 4), "lon": round(lon, 4), "match_method": f"open_meteo_geocoding ({res_name}, {res_admin})"})
        else:
            unmatched.append({"state": st, "district": dt, "reason": "no_match_found"})

    save_geocoding_cache(cache)

    coords_df = pd.DataFrame(results)
    coords_df.to_csv(OUTPUT_COORDS_CSV, index=False, encoding="utf-8")
    print(f"\nSaved coordinates to: {OUTPUT_COORDS_CSV}", flush=True)
    print(f"Total matched: {len(coords_df)} / {len(pairs)} ({len(coords_df)/len(pairs)*100:.1f}%)", flush=True)

    unmatched_df = pd.DataFrame(unmatched)
    unmatched_df.to_csv(OUTPUT_UNMATCHED_CSV, index=False, encoding="utf-8")
    print(f"Saved unmatched to: {OUTPUT_UNMATCHED_CSV} (count: {len(unmatched_df)})", flush=True)

if __name__ == "__main__":
    main()
