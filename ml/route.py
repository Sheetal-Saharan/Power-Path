import openrouteservice

def get_optimized_route_and_distance(api_key, start_lat, start_lon, end_lat, end_lon):
    # Initialize OpenRouteService client with your API key
    client = openrouteservice.Client(key=api_key)
    
    # Coordinates for source (start) and destination (end)
    start_coords = (start_lon, start_lat)  # OpenRouteService uses (lon, lat) order
    end_coords = (end_lon, end_lat)
    
    # Request for optimized route (directions)
    routes = client.directions(
        coordinates=[start_coords, end_coords],
        profile='driving-car',  # You can change this to 'cycling-regular', 'foot-walking', etc.
        format='geojson'
    )
    
    # Extract route geometry and distance
    route_geometry = routes['features'][0]['geometry']['coordinates']
    route_distance = routes['features'][0]['properties']['segments'][0]['distance'] / 1000  # Distance in km
    
    print("Route Distance: {:.2f} km".format(route_distance))
    print("Route Geometry (Longitude, Latitude points):")
    for point in route_geometry:
        print(f"Longitude: {point[0]}, Latitude: {point[1]}")
    
    return route_geometry, route_distance

# Example usage
api_key = '5b3ce3597851110001cf6248042e58e4f6874a9fb5fe032501200cc6'  # Replace with your OpenRouteService API key
start_lat = 28.6304  
start_lon = 77.2177 
end_lat = 28.634996929264886
end_lon = 77.21967228284348

get_optimized_route_and_distance(api_key, start_lat, start_lon, end_lat, end_lon)
