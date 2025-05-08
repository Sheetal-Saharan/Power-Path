from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
import requests
import json
import openrouteservice
import uvicorn
import math
import numpy as np
import joblib
from tensorflow.keras.models import load_model
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

CHARGER_API_KEY = '5dbfac88-8da5-4cc4-bafa-6bbecffcf56c'
ROUTING_API_KEY = '5b3ce3597851110001cf6248042e58e4f6874a9fb5fe032501200cc6'
routing_client = openrouteservice.Client(key=ROUTING_API_KEY)

def load_saved_models():
    m = {
        'SOH': {
            'simple_nn': load_model('saved_models/SOH_LSTM.keras'),
            'lstm': load_model('saved_models/SOH_LSTM.keras'),
            'rf': joblib.load('saved_models/SOH_RandomForest.joblib'),
            'scaler': joblib.load('saved_models/soh_scaler.joblib')
        }
    }
    return m

def predict_hybrid(a, b, c):
    return np.mean([a, b, c], axis=0)

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2)**2 +
         math.cos(math.radians(lat1)) *
         math.cos(math.radians(lat2)) *
         math.sin(dlon / 2)**2)
    return 2 * R * math.asin(math.sqrt(a))

def get_optimized_route_and_distance(slat, slon, elat, elon):
    start_coords = (slon, slat)
    end_coords = (elon, elat)
    r = routing_client.directions([start_coords, end_coords], profile='driving-car', format='geojson')
    coords = r['features'][0]['geometry']['coordinates']
    # distance is in meters => convert to km
    dist_km = r['features'][0]['properties']['segments'][0]['distance'] / 1000
    return coords, dist_km

def build_cumulative_distance(route_coords):
    """
    Returns a list of cumulative distances (km) at each coordinate in 'route_coords'
    from the start of the route.
    """
    cumdist = [0.0]
    for i in range(1, len(route_coords)):
        lon1, lat1 = route_coords[i - 1]
        lon2, lat2 = route_coords[i]
        segment_dist = haversine(lat1, lon1, lat2, lon2)
        cumdist.append(cumdist[-1] + segment_dist)
    return cumdist

def find_nearby_ev_chargers(lat, lon, distance=2, max_results=20):
    url = "https://api.openchargemap.io/v3/poi"
    params = {
        'key': CHARGER_API_KEY,
        'latitude': lat,
        'longitude': lon,
        'distance': distance,
        'maxresults': max_results,
        'compact': True,
        'verbose': False,
    }
    try:
        resp = requests.get(url, params=params)
        resp.raise_for_status()
        data = json.loads(resp.text)
        return data if data else []
    except:
        return []

def gather_chargers_along_route(route_coords, step_distance_km=5, search_radius_km=2):
    """
    Walk along the route in steps of `step_distance_km`.
    At each step, search for chargers within `search_radius_km`.
    """
    found = []
    seen_ids = set()

    distance_accum = 0.0
    last_lon, last_lat = route_coords[0]
    for i in range(1, len(route_coords)):
        curr_lon, curr_lat = route_coords[i]
        seg_dist = haversine(last_lat, last_lon, curr_lat, curr_lon)
        distance_accum += seg_dist

        if distance_accum >= step_distance_km:
            chargers = find_nearby_ev_chargers(curr_lat, curr_lon, distance=search_radius_km, max_results=5)
            for ch in chargers:
                cid = ch.get("ID")
                if cid not in seen_ids:
                    found.append(ch)
                    seen_ids.add(cid)

            distance_accum = 0.0
            last_lon, last_lat = curr_lon, curr_lat

    return found

def get_route_index_of_charger(route_coords, charger_lat, charger_lon):
    """
    Return the index on the route where the charger is closest.
    """
    best_i = None
    best_d = float("inf")
    for i, (rlon, rlat) in enumerate(route_coords):
        d = haversine(rlat, rlon, charger_lat, charger_lon)
        if d < best_d:
            best_d = d
            best_i = i
    return best_i

@app.post("/route_pred")
async def route_pred(
    start_lat: float = Query(...),
    start_long: float = Query(...),
    dest_lat: float = Query(...),
    dest_long: float = Query(...),
    current_charge: float = Query(..., description="Current battery % (0 to 100)"),
    max_distance: float = Query(..., description="Max distance (km) on a 100% charge"),
):
    """
    Determine if the route is drivable with the current charge, and if not,
    how much charge is needed to reach either the destination or the nearest station.
    """
    # 1) Compute the total route
    route_coords, route_dist = get_optimized_route_and_distance(start_lat, start_long, dest_lat, dest_long)

    # 2) Compute how far we can go with the current charge
    available_range = (current_charge / 100.0) * max_distance

    # 3) Gather all chargers along the route
    chargers_along_route = gather_chargers_along_route(route_coords, step_distance_km=5, search_radius_km=2)

    # 4) If the entire route is within our current range => done
    if route_dist <= available_range:
        return JSONResponse({
            'route': route_coords,
            'total_distance_km': route_dist,
            'chargers_along_route': chargers_along_route,
            'reachable': True,
            'message': 'Entire route is within current battery range.',
            'needed_charge_percent': 0.0
        })

    # 5) Build cumulative distances
    cumdist = build_cumulative_distance(route_coords)

    # 6) For each charger, find how far it is from the start
    charger_distances = []
    for ch in chargers_along_route:
        ai = ch.get("AddressInfo", {})
        clat = ai.get("Latitude")
        clon = ai.get("Longitude")
        if clat is None or clon is None:
            continue
        try:
            clat = float(clat)
            clon = float(clon)
        except:
            continue

        idx = get_route_index_of_charger(route_coords, clat, clon)
        dist_from_start = cumdist[idx]  # Distance from start of route to charger
        charger_distances.append((dist_from_start, idx, clat, clon, ch))

    # If we didn't find any chargers, then we can't proceed at all
    if not charger_distances:
        needed_charge_to_finish = (route_dist / max_distance) * 100
        return JSONResponse({
            'route': route_coords,
            'total_distance_km': route_dist,
            'chargers_along_route': chargers_along_route,
            'reachable': False,
            'message': (
                'No chargers found along route. Additional charge is needed to go directly.'
            ),
            # If needed_charge_to_finish > 100, it means not possible with 1 full charge
            'needed_charge_percent': needed_charge_to_finish
        })

    # 7) Among all chargers, find those within `available_range`
    reachable_chargers = [cd for cd in charger_distances if cd[0] <= available_range]

    if not reachable_chargers:
        # If we can't reach any charger, let's see how much charge is needed
        # to at least get to the *closest* charger from the start:
        charger_distances.sort(key=lambda x: x[0])  # sort ascending by distance
        closest_dist, _, _, _, closest_charger = charger_distances[0]
        needed_charge_to_reach_closest = (closest_dist / max_distance) * 100
        return JSONResponse({
            'route': route_coords,
            'total_distance_km': route_dist,
            'chargers_along_route': chargers_along_route,
            'reachable': False,
            'message': (
                'No charging station is reachable with current battery. '
                'Increase initial charge.'
            ),
            'closest_charger': closest_charger,
            'needed_charge_percent': needed_charge_to_reach_closest
        })

    # 8) If at least one charger is reachable, pick the nearest one
    reachable_chargers.sort(key=lambda x: x[0])
    dist_nearest, idx_nearest, lat_nearest, lon_nearest, nearest_charger = reachable_chargers[0]

    # Distance from that charger to the end
    dist_charger_to_end = route_dist - dist_nearest
    if dist_charger_to_end <= available_range:
        # We can finish from the nearest charger
        return JSONResponse({
            'route': route_coords,
            'total_distance_km': route_dist,
            'chargers_along_route': chargers_along_route,
            'reachable': True,
            'message': (
                'Trip is possible with one stop. The nearest station is reachable '
                'with current charge, and the destination is within range from there.'
            ),
            'nearest_charger': nearest_charger,
            'needed_charge_percent': 0.0
        })
    else:
        # We can reach a charger, but not the destination from that charger
        needed_charge_from_charger_to_end = (dist_charger_to_end / max_distance) * 100
        return JSONResponse({
            'route': route_coords,
            'total_distance_km': route_dist,
            'chargers_along_route': chargers_along_route,
            'reachable': False,
            'message': (
                'Cannot reach destination with only one stop. You need additional charge '
                'from the station to reach the end.'
            ),
            'nearest_charger': nearest_charger,
            'needed_charge_percent': needed_charge_from_charger_to_end
        })
    
models = load_saved_models()

@app.get("/predict_soh")
async def predict_soh(
    terminal_voltage: float = Query(...),
    terminal_current: float = Query(...),
    temperature: float = Query(...),
    charge_current: float = Query(...),
    charge_voltage: float = Query(...),
    capacity: float = Query(...),
    cycle: int = Query(...)
):
    x = np.array([[terminal_voltage, terminal_current, temperature, charge_current, charge_voltage, capacity, cycle]])
    xs = models['SOH']['scaler'].transform(x)
    xs_ = xs.reshape(1, 1, 7)

    p1 = models['SOH']['simple_nn'].predict(xs_)[0][0]
    p2 = models['SOH']['lstm'].predict(xs_)[0][0]
    p3 = models['SOH']['rf'].predict(xs)[0]

    hybrid = predict_hybrid(p1, p2, p3)

    return JSONResponse({'soh': float(hybrid)})

if __name__ == "__main__":
    uvicorn.run(app)