"""
Fasal Saathi - NASA POWER Monthly Weather Downloader & Aggregator
Downloads monthly agroclimatology weather from NASA POWER API (1997-2016)
for all 652 unique districts in the crop dataset and aggregates seasonal features.
"""

import os
import re
import sys
import json
import time
import calendar
import argparse
import requests
import numpy as np
import pandas as pd
from tqdm import tqdm

sys.stdout.reconfigure(encoding='utf-8')

# Windows sleep prevention to ensure laptop doesn't go to sleep during run
try:
    import ctypes
    # ES_CONTINUOUS (0x80000000) | ES_SYSTEM_REQUIRED (0x00000001) | ES_AWAYMODE_REQUIRED (0x00000040)
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000 | 0x00000001 | 0x00000040)
    print("Windows sleep prevention activated: System will stay awake during processing.")
except Exception:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(BASE_DIR)
DATASET_PATH = os.path.join(BACKEND_DIR, "crop_production.csv.zip")
COORDS_CSV = os.path.join(BASE_DIR, "district_coords.csv")
RAW_NASA_DIR = os.path.join(BASE_DIR, "weather_nasa_raw")
FEATURES_CSV = os.path.join(BASE_DIR, "weather_features.csv")
NORMALS_JSON = os.path.join(BASE_DIR, "district_weather_normals.json")

os.makedirs(RAW_NASA_DIR, exist_ok=True)

START_YEAR = 1997
END_YEAR = 2016  # Extended to 2016 so Rabi 2015 (Jan-Mar 2016) is fully populated

PRIMARY_PARAMS = ["T2M", "T2M_MAX", "T2M_MIN", "PRECTOTCORR", "RH2M"]
FALLBACK_PARAMS = ["T2M", "PRECTOTCORR", "RH2M"]

def sanitize_filename(name):
    return re.sub(r'[^a-zA-Z0-9_-]', '_', str(name))

def get_cache_filepath(state, district):
    fname = f"{sanitize_filename(state)}__{sanitize_filename(district)}.json"
    return os.path.join(RAW_NASA_DIR, fname)

def download_district_nasa(lat, lon, cache_file, session):
    """
    Downloads monthly weather data from NASA POWER API (1997-2016).
    Checks that 2016 data is present; if not, re-downloads to include 2016.
    Handles HTTP 429 / network errors with 60s sleep and up to 5 retries.
    If a district still fails after 5 retries, logs error and returns (None, False, elapsed).
    Returns (data_dict, was_cached, elapsed_seconds)
    """
    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                props = data.get("properties", {}).get("parameter", {})
                if props and "T2M" in props:
                    # Require 2016 data to be present in cache
                    if "201601" in props["T2M"]:
                        return data, True, 0.0
        except Exception:
            pass

    params_str = ",".join(PRIMARY_PARAMS)
    url = (
        f"https://power.larc.nasa.gov/api/temporal/monthly/point?"
        f"parameters={params_str}&community=AG&"
        f"longitude={lon:.4f}&latitude={lat:.4f}&"
        f"start={START_YEAR}&end={END_YEAR}&format=JSON"
    )

    max_retries = 5
    start_time = time.time()

    for attempt in range(max_retries):
        try:
            r = session.get(url, timeout=40)
            if r.status_code == 200:
                data = r.json()
                with open(cache_file, "w", encoding="utf-8") as f:
                    json.dump(data, f)
                elapsed = time.time() - start_time
                return data, False, elapsed
            elif r.status_code in (400, 422):
                # Try fallback without T2M_MAX / T2M_MIN
                fallback_str = ",".join(FALLBACK_PARAMS)
                fb_url = (
                    f"https://power.larc.nasa.gov/api/temporal/monthly/point?"
                    f"parameters={fallback_str}&community=AG&"
                    f"longitude={lon:.4f}&latitude={lat:.4f}&"
                    f"start={START_YEAR}&end={END_YEAR}&format=JSON"
                )
                r_fb = session.get(fb_url, timeout=40)
                if r_fb.status_code == 200:
                    data = r_fb.json()
                    with open(cache_file, "w", encoding="utf-8") as f:
                        json.dump(data, f)
                    elapsed = time.time() - start_time
                    return data, False, elapsed
                else:
                    time.sleep(5)
            elif r.status_code == 429:
                print(f"\n[HTTP 429] Rate limit hit. Sleeping 60s (attempt {attempt+1}/{max_retries})...", flush=True)
                time.sleep(60)
            else:
                print(f"\n[HTTP {r.status_code}] Network response. Sleeping 60s (attempt {attempt+1}/{max_retries})...", flush=True)
                time.sleep(60)
        except Exception as e:
            print(f"\n[Request Error: {e}] Sleeping 60s (attempt {attempt+1}/{max_retries})...", flush=True)
            time.sleep(60)

    elapsed = time.time() - start_time
    return None, False, elapsed


def parse_nasa_monthly(data):
    """
    Parses NASA POWER monthly properties into lookup:
    lookup[param][(year, month)] = value
    Treats -999 and <= -900 as NaN.
    Excludes month 13 (annual average).
    """
    props = data.get("properties", {}).get("parameter", {})
    parsed = {}
    for param, vals in props.items():
        parsed[param] = {}
        for ym_str, val in vals.items():
            if len(ym_str) == 6:
                yr = int(ym_str[:4])
                mo = int(ym_str[4:])
                if mo == 13:
                    continue  # Annual summary
                val_float = float(val) if val is not None else np.nan
                if val_float <= -900:
                    val_float = np.nan
                parsed[param][(yr, mo)] = val_float
    return parsed


def get_season_months(crop_year, season):
    """
    Season month mapping (documented):
    - Kharif: Jun-Oct of Crop_Year (months 6, 7, 8, 9, 10)
    - Rabi: Nov of Crop_Year to Mar of Crop_Year+1 (months 11, 12 of Crop_Year, and 1, 2, 3 of Crop_Year+1)
    - Summer: Mar-May of Crop_Year (months 3, 4, 5)
    - Autumn: Aug-Nov of Crop_Year (months 8, 9, 10, 11)
    - Winter: Nov of Crop_Year to Feb of Crop_Year+1 (months 11, 12 of Crop_Year, and 1, 2 of Crop_Year+1)
    - Whole Year: Jan-Dec of Crop_Year (months 1 to 12)
    Returns list of (year, month) tuples.
    """
    s = season.strip().title()
    if s == "Kharif":
        return [(crop_year, m) for m in [6, 7, 8, 9, 10]]
    elif s == "Rabi":
        return [(crop_year, 11), (crop_year, 12), (crop_year + 1, 1), (crop_year + 1, 2), (crop_year + 1, 3)]
    elif s == "Summer":
        return [(crop_year, m) for m in [3, 4, 5]]
    elif s == "Autumn":
        return [(crop_year, m) for m in [8, 9, 10, 11]]
    elif s == "Winter":
        return [(crop_year, 11), (crop_year, 12), (crop_year + 1, 1), (crop_year + 1, 2)]
    elif s in ("Whole Year", "Wholeyear"):
        return [(crop_year, m) for m in range(1, 13)]
    else:
        return [(crop_year, m) for m in range(1, 13)]


def aggregate_season_weather(parsed, crop_year, season):
    """
    Computes (rain_mm, temp_mean, temp_max, temp_min, humidity_mean)
    - PRECTOTCORR is mm/day: multiply by number of calendar days in that month, then sum.
    - Temperature and humidity: average over available season months.
    """
    ym_list = get_season_months(crop_year, season)

    rain_list = []
    tmean_list = []
    tmax_list = []
    tmin_list = []
    hum_list = []

    prec_dict = parsed.get("PRECTOTCORR", {})
    t2m_dict = parsed.get("T2M", {})
    tmax_dict = parsed.get("T2M_MAX", {})
    tmin_dict = parsed.get("T2M_MIN", {})
    rh2m_dict = parsed.get("RH2M", {})

    for yr, mo in ym_list:
        num_days = calendar.monthrange(yr, mo)[1]

        # Rain
        r_rate = prec_dict.get((yr, mo))
        if r_rate is not None and not np.isnan(r_rate):
            rain_list.append(r_rate * num_days)

        # Temp mean
        tm = t2m_dict.get((yr, mo))
        if tm is not None and not np.isnan(tm):
            tmean_list.append(tm)

        # Temp max
        tx = tmax_dict.get((yr, mo))
        if tx is not None and not np.isnan(tx):
            tmax_list.append(tx)

        # Temp min
        tn = tmin_dict.get((yr, mo))
        if tn is not None and not np.isnan(tn):
            tmin_list.append(tn)

        # Humidity
        hm = rh2m_dict.get((yr, mo))
        if hm is not None and not np.isnan(hm):
            hum_list.append(hm)

    rain_val = round(float(np.sum(rain_list)), 2) if len(rain_list) > 0 else np.nan
    tmean_val = round(float(np.mean(tmean_list)), 2) if len(tmean_list) > 0 else np.nan
    tmax_val = round(float(np.mean(tmax_list)), 2) if len(tmax_list) > 0 else np.nan
    tmin_val = round(float(np.mean(tmin_list)), 2) if len(tmin_list) > 0 else np.nan
    hum_val = round(float(np.mean(hum_list)), 2) if len(hum_list) > 0 else np.nan

    return rain_val, tmean_val, tmax_val, tmin_val, hum_val


def run_full():
    print("=" * 75, flush=True)
    print("STARTING FULL 652-DISTRICT DOWNLOAD & AGGREGATION VIA NASA POWER (1997-2016)", flush=True)
    print("=" * 75, flush=True)

    coords_df = pd.read_csv(COORDS_CSV)
    total_districts = len(coords_df)
    print(f"Total districts in dataset: {total_districts}", flush=True)

    session = requests.Session()
    session.headers.update({"User-Agent": "FasalSaathi-NASAWeather/1.0"})

    api_calls_made = 0
    cached_hits = 0
    failed_districts = []
    start_total_time = time.time()

    all_parsed_weather = {}

    pbar = tqdm(coords_df.iterrows(), total=total_districts, desc="Downloading NASA weather")

    for idx, row in pbar:
        st = row["state"]
        dt = row["district"]
        lat = float(row["lat"])
        lon = float(row["lon"])
        cache_file = get_cache_filepath(st, dt)

        data, was_cached, _ = download_district_nasa(lat, lon, cache_file, session)

        if data is None:
            failed_districts.append((st, dt))
            print(f"\n[FAILED] District: {st} - {dt} after 5 retries. Continuing to next district...", flush=True)
            continue

        if was_cached:
            cached_hits += 1
        else:
            api_calls_made += 1
            time.sleep(1.2)  # Polite sleep between API calls

        # Progress reporting every 25 districts
        if (idx + 1) % 25 == 0 or (idx + 1) == total_districts:
            tqdm.write(f"[{idx+1}/{total_districts} districts processed] (API calls: {api_calls_made}, Cached: {cached_hits}, Failed: {len(failed_districts)})")

        parsed = parse_nasa_monthly(data)
        norm_key = (re.sub(r'[^a-z0-9]', '', str(st).lower()), re.sub(r'[^a-z0-9]', '', str(dt).lower()))
        all_parsed_weather[norm_key] = parsed

    total_download_time = time.time() - start_total_time
    print(f"\nDownload phase complete in {total_download_time/60.0:.2f} minutes.")
    print(f"Districts successfully loaded: {len(all_parsed_weather)}/{total_districts}")
    print(f"Fresh API calls made: {api_calls_made}, Cached hits: {cached_hits}, Failures: {len(failed_districts)}")

    print("\n" + "=" * 75, flush=True)
    print("STEP 3: COMPUTING SEASONAL FEATURES", flush=True)
    print("=" * 75, flush=True)

    crop_df = pd.read_csv(DATASET_PATH)
    crop_df["Season"] = crop_df["Season"].astype(str).str.strip()
    
    # Filter to Crop_Year 1997-2015 as requested
    crop_df = crop_df[(crop_df["Crop_Year"] >= 1997) & (crop_df["Crop_Year"] <= 2015)]
    combos = crop_df[["State_Name", "District_Name", "Crop_Year", "Season"]].drop_duplicates().copy()
    print(f"Total unique (State, District, Year, Season) combinations: {len(combos):,}", flush=True)

    feature_rows = []
    for _, row in tqdm(combos.iterrows(), total=len(combos), desc="Aggregating features"):
        st = row["State_Name"]
        dt = row["District_Name"]
        yr = int(row["Crop_Year"])
        sn = row["Season"]

        norm_st_dt = (re.sub(r'[^a-z0-9]', '', str(st).lower()), re.sub(r'[^a-z0-9]', '', str(dt).lower()))
        parsed = all_parsed_weather.get(norm_st_dt)

        if parsed is not None:
            rain_mm, tmean, tmax, tmin, hum = aggregate_season_weather(parsed, yr, sn)
        else:
            rain_mm, tmean, tmax, tmin, hum = np.nan, np.nan, np.nan, np.nan, np.nan

        feature_rows.append({
            "State_Name": st,
            "District_Name": dt,
            "Crop_Year": yr,
            "Season": sn,
            "rain_mm": rain_mm,
            "temp_mean": tmean,
            "temp_max": tmax,
            "temp_min": tmin,
            "humidity_mean": hum
        })

    feat_df = pd.DataFrame(feature_rows)
    feat_df.to_csv(FEATURES_CSV, index=False, encoding="utf-8")
    print(f"Saved weather features to: {FEATURES_CSV}")
    print(f"Total rows in weather_features.csv: {len(feat_df):,}")

    print("\n" + "=" * 75, flush=True)
    print("STEP 4: COMPUTING DISTRICT WEATHER NORMALS FOR THE APP", flush=True)
    print("=" * 75, flush=True)

    national_normals = {}
    for sn, g in feat_df.groupby("Season"):
        national_normals[sn] = {
            "rain_mm": round(float(g["rain_mm"].dropna().mean()), 2),
            "temp_mean": round(float(g["temp_mean"].dropna().mean()), 2),
            "temp_max": round(float(g["temp_max"].dropna().mean()), 2),
            "temp_min": round(float(g["temp_min"].dropna().mean()), 2),
            "humidity_mean": round(float(g["humidity_mean"].dropna().mean()), 2),
        }

    state_normals = {}
    for (st, sn), g in feat_df.groupby(["State_Name", "Season"]):
        if st not in state_normals:
            state_normals[st] = {}
        state_normals[st][sn] = {
            "rain_mm": round(float(g["rain_mm"].dropna().mean()), 2),
            "temp_mean": round(float(g["temp_mean"].dropna().mean()), 2),
            "temp_max": round(float(g["temp_max"].dropna().mean()), 2),
            "temp_min": round(float(g["temp_min"].dropna().mean()), 2),
            "humidity_mean": round(float(g["humidity_mean"].dropna().mean()), 2),
        }

    normals_dict = {
        "_national_avg": national_normals
    }

    for (st, dt, sn), g in feat_df.groupby(["State_Name", "District_Name", "Season"]):
        if st not in normals_dict:
            normals_dict[st] = {
                "_state_avg": state_normals.get(st, {})
            }
        if dt not in normals_dict[st]:
            normals_dict[st][dt] = {}

        normals_dict[st][dt][sn] = {
            "rain_mm": round(float(g["rain_mm"].dropna().mean()), 2),
            "temp_mean": round(float(g["temp_mean"].dropna().mean()), 2),
            "temp_max": round(float(g["temp_max"].dropna().mean()), 2),
            "temp_min": round(float(g["temp_min"].dropna().mean()), 2),
            "humidity_mean": round(float(g["humidity_mean"].dropna().mean()), 2),
        }

    with open(NORMALS_JSON, "w", encoding="utf-8") as f:
        json.dump(normals_dict, f, indent=2, ensure_ascii=False)
    print(f"Saved weather normals to: {NORMALS_JSON}")

    print("\n" + "=" * 75, flush=True)
    print("STEP 5: CHECKS & SUMMARY STATS", flush=True)
    print("=" * 75, flush=True)
    print(f"Districts in dataset: {total_districts}")
    print(f"Districts downloaded successfully: {len(all_parsed_weather)}")
    print(f"Failed districts count: {len(failed_districts)}")
    if failed_districts:
        print(f"Failed list: {failed_districts}")
    print(f"Rows in weather_features.csv: {len(feat_df):,}")
    print(f"\nMissing value count per column in weather_features.csv:")
    print(feat_df.isnull().sum().to_string())

    print("\n--- SANITY EXAMPLES (Average Kharif over all years) ---")
    for st_check, dt_check in [("Punjab", "LUDHIANA"), ("Rajasthan", "JAISALMER"), ("Odisha", "CUTTACK")]:
        sub_check = feat_df[(feat_df["State_Name"] == st_check) & (feat_df["District_Name"] == dt_check) & (feat_df["Season"] == "Kharif")]
        if len(sub_check) > 0:
            print(f"- {st_check} - {dt_check} (Kharif avg over {len(sub_check)} years): Rain = {sub_check['rain_mm'].mean():.1f} mm | Temp_mean = {sub_check['temp_mean'].mean():.1f} °C")

    print("\nALL STEPS COMPLETED SUCCESSFULLY!", flush=True)


if __name__ == "__main__":
    run_full()
