import requests
import json

# Replace with your OpenChargeMap API key
API_KEY = '5dbfac88-8da5-4cc4-bafa-6bbecffcf56c'

def display_ev_chargers(chargers):
    for charger in chargers:
        # Extract basic charger details
        address_info = charger.get("AddressInfo", {})
        
        name = address_info.get("Title", "N/A")
        address_line = address_info.get("AddressLine1", "N/A")
        city = address_info.get("Town", "N/A")
        state = address_info.get("StateOrProvince", "N/A")
        
        # Get latitude and longitude
        latitude = address_info.get("Latitude", "N/A")
        longitude = address_info.get("Longitude", "N/A")

        print(f"Charger Location: {name}")
        print(f"Address: {address_line}, {city}, {state}")
        print(f"Latitude: {latitude}, Longitude: {longitude}")

        print("-" * 50)

# Function to find nearby EV chargers
def find_nearby_ev_chargers(latitude, longitude, distance=10):
    # Define the base URL for the Open Charge Map API
    url = "https://api.openchargemap.io/v3/poi"
    
    # Parameters for the API request
    params = {
        'key': API_KEY,  # API key
        'latitude': latitude,  # Latitude of the location
        'longitude': longitude,  # Longitude of the location
        'distance': distance,  # Distance in kilometers to search for chargers
        'maxresults': 5,  # Max number of results to return
        'compact': True,  # Compact results (useful for easy parsing)
        'verbose': False,  # Detailed information (set to False for basic details)
    }
    
    try:
        # Send the GET request to the API
        response = requests.get(url, params=params)
        response.raise_for_status()  # Raise exception for HTTP errors
        # Parse the JSON response
        chargers = response.json()
        chargers_data = json.loads(response.text)
        if chargers:
            print(f"Found {len(chargers)} EV chargers nearby:")
            display_ev_chargers(chargers_data)
        else:
            print("No nearby EV chargers found.")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")

# Example usage
if __name__ == "__main__":
    # Example: Searching for chargers near a specific location (e.g., New York City)
    latitude = 28.6304
    longitude = 77.2177
    find_nearby_ev_chargers(latitude, longitude)
