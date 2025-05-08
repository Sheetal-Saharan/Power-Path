import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icons
const userIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/128/9179/9179005.png', // Replace with your desired user location icon
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

const destinationIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Replace with your desired destination icon
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

const chargericon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/128/4430/4430939.png', // Replace with your desired destination icon
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

const Map = ({ routePoints, defaultLoc, selectedDestination, distance, slat, slong, selectedCharger }) => {
    
    const [position, setPosition] = useState([defaultLoc.lat, defaultLoc.lng]); // Default to Mumbai
    const [destination, setDestination] = useState(null);
   console.log("USER POSI - ", defaultLoc)

    // Memoize the formatted route points to prevent unnecessary calculations
    const formattedRoutePoints = useMemo(() => {
        return routePoints?.map(([long, lat]) => [lat, long]);
    }, [routePoints]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
            },
            (err) => {
                console.error('Error fetching location:', err);
                alert('Please enable location services to see your position on the map.');
            }
        );
    }, []);

    useEffect(() => {
        if (formattedRoutePoints && formattedRoutePoints.length > 0) {
            setDestination(formattedRoutePoints[formattedRoutePoints.length - 50]);
        }
    }, [formattedRoutePoints]);

    return (
        <div className="w-full h-[500px] shadow-lg rounded-lg overflow-hidden border border-gray-200">
            <MapContainer center={[defaultLoc.lat, defaultLoc.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap contributors"
                />

                {/* User's location marker */}
                <Marker position={position} icon={userIcon}>
                    <Tooltip>
                        <span className="text-sm font-semibold text-purple-600">You are here!</span>
                    </Tooltip>
                </Marker>

                {/* Charger Station Marker */}
                {slat && slong && (
                    <Marker position={[slat, slong]} icon={chargericon}>
                        <Tooltip>
                            <span className="text-sm font-semibold text-purple-600">
                                Nearest Charging Station
                            </span>
                        </Tooltip>
                    </Marker>
                )}

                {/* Selected Charger Marker */}
                {selectedCharger && (
                    <Marker position={[selectedCharger.AddressInfo.Latitude, selectedCharger.AddressInfo.Longitude]} icon={chargericon}>
                        <Tooltip>
                            <span className="text-sm font-semibold text-purple-600">
                                {selectedCharger.AddressInfo.Title}
                            </span>
                        </Tooltip>
                    </Marker>
                )}

                {selectedDestination && (
                    <Marker position={[selectedDestination.lat, selectedDestination.lng]} icon={destinationIcon}>
                        <Tooltip>
                            <span className="text-xl font-semibold text-green-600">Your Destination</span>
                            <p className="text-md font-semibold text-red-600">Total Distance : {Math.round(distance)} km</p>
                        </Tooltip>
                    </Marker>
                )}

                {/* Route polyline */}
                {formattedRoutePoints && (
                    <Polyline positions={formattedRoutePoints} color="blue" />
                )}
            </MapContainer>
        </div>
    );
};

export default Map;