import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import axios from 'axios';
import { FiSearch, FiBatteryCharging, FiMapPin, FiAlertCircle } from 'react-icons/fi';

const Home = () => {
    const [routePoints, setRoutePoints] = useState([]);
    const [showCarModal, setShowCarModal] = useState(false);
    const [showBatteryModal, setShowBatteryModal] = useState(false);
    const [cars, setCars] = useState([]);
    const [selectedCar, setSelectedCar] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [distance, setDistance] = useState(null);
    const [currentCharge, setCurrentCharge] = useState(50); // Default to 50%
    const [chargersAlongRoute, setChargersAlongRoute] = useState([]);
    const [selectedCharger, setSelectedCharger] = useState(null);
    const [userPosition, setUserPosition] = useState(
        JSON.parse(localStorage.getItem('userPosition')) || { lat: 0, lng: 0 }
    );
    const [message, setMessage] = useState("");

    // Fetch user's current location
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                localStorage.setItem('userPosition', JSON.stringify(coords));
                setUserPosition(coords);
            },
            (err) => {
                console.error(err);
                alert('Please allow location access to use this feature.');
            }
        );

        // Fetch user's cars
        const userCars = JSON.parse(localStorage.getItem('userCars')) || [];
        setCars(userCars);
    }, []);

    const fetchRoute = async () => {
        if (!userPosition || userPosition.lat === 0 || userPosition.lng === 0) {
            alert('Unable to fetch location. Please allow location access and refresh the page.');
            return;
        }

        if (!selectedCar) {
            setShowCarModal(true);
            return;
        }

        if (!selectedDestination) {
            alert('Please select a destination.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`http://127.0.0.1:8000/route_pred`, null, {
                params: {
                    start_lat: userPosition.lat,
                    start_long: userPosition.lng,
                    dest_lat: selectedDestination.lat,
                    dest_long: selectedDestination.lng,
                    max_distance: selectedCar.maxDistance,
                    current_charge: currentCharge,
                },
            });
            setDistance(response.data.total_distance_km);
            setRoutePoints(response.data.route);
            setChargersAlongRoute(response.data.chargers_along_route);
            setMessage(response.data.message);
            console.log(response.data);
        } catch (err) {
            console.error(err);
            alert('No EV Charger in your Route');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery) return;
        try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: {
                    q: searchQuery,
                    format: 'json',
                    limit: 5,
                },
            });
            setSearchResults(res.data);
        } catch (err) {
            console.error(err);
            alert('Error fetching location suggestions.');
        }
    };

    const fetchCars = async () => {
        const userId = localStorage.getItem('userId');
        try {
            const res = await axios.get(`http://localhost:5000/api/car/${userId}`);
            setCars(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 text-center text-3xl font-bold shadow-lg">
                EV Charging Station Finder
            </header>

            {/* Main Content */}
            <main className="flex flex-col lg:flex-row p-6 gap-6">
                {/* Sidebar */}
                <div className="w-full lg:w-1/4 bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Plan Your Route</h2>

                    {/* Car Selection */}
                    <div className="mb-6">
                        <button
                            onClick={() => setShowCarModal(true)}
                            className="w-full flex items-center justify-between bg-blue-50 text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-100 transition duration-200"
                        >
                            <span>{selectedCar ? selectedCar.name : 'Select Your Car'}</span>
                            <FiBatteryCharging className="text-xl" />
                        </button>
                    </div>

                    {/* Battery Input */}
                    <div className="mb-6">
                        <button
                            onClick={() => setShowBatteryModal(true)}
                            className="w-full flex items-center justify-between bg-blue-50 text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-100 transition duration-200"
                        >
                            <span>Battery: {currentCharge}%</span>
                            <FiBatteryCharging className="text-xl" />
                        </button>
                    </div>

                    {/* Destination Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search for a destination..."
                                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                onClick={handleSearch}
                                className="absolute right-2 top-2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-200"
                            >
                                <FiSearch className="text-xl" />
                            </button>
                        </div>
                        {searchResults.length > 0 && (
                            <div className="mt-2 bg-white border rounded-lg shadow-lg">
                                {searchResults.map((result) => (
                                    <div
                                        key={result.place_id}
                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setSelectedDestination({
                                                lat: parseFloat(result.lat),
                                                lng: parseFloat(result.lon),
                                            });
                                            setSearchQuery(result.display_name);
                                            setSearchResults([]);
                                        }}
                                    >
                                        {result.display_name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {message && (
                        <>
                            <p className='text-red-500 gap-2 my-5 flex'><FiAlertCircle size={40} />{message}</p>
                        </>
                    )}

                    {/* Find Route Button */}
                    <button
                        onClick={fetchRoute}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition-transform"
                    >
                        Find Nearest Charging Station
                    </button>

                    {/* Chargers Along Route List */}
                    {chargersAlongRoute.length > 0 && (
                        <div className="w-full max-w-4xl mt-6">
                            <h2 className="text-xl font-bold text-gray-700 mb-4">Chargers Along Route</h2>
                            <div className="bg-white border rounded-lg shadow-lg p-4">
                                {chargersAlongRoute.map((charger) => (
                                    <div
                                        key={charger.ID}
                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => setSelectedCharger(charger)}
                                    >
                                        <div className="font-semibold">{charger.AddressInfo.Title}</div>
                                        <div className="text-sm text-gray-600">{charger.AddressInfo.AddressLine1}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Map Section */}
                <div className="w-full lg:w-3/4 bg-white rounded-lg shadow-lg z-0 overflow-hidden relative">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50  z-20">
                            <div className="loading-spinner"></div> {/* Spinner */}
                        </div>
                    )}
                    <Map
                    
                        defaultLoc={userPosition}
                        routePoints={routePoints}
                        selectedDestination={selectedDestination}
                        distance={distance}
                        selectedCharger={selectedCharger}
                    />
                </div>
            </main>

            {/* Modals */}
            {showCarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Select Your Car</h2>
                        <select
                            className="w-full p-3 border rounded-lg mb-4"
                            value={selectedCar?.name || ''}
                            onChange={(e) => setSelectedCar(cars.find((car) => car.name === e.target.value))}
                        >
                            <option value="">Choose your car</option>
                            {cars.map((car) => (
                                <option key={car.name} value={car.name}>
                                    {car.name} - {car.maxDistance} km
                                </option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowCarModal(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (!selectedCar) {
                                        alert('Please select a car.');
                                        return;
                                    }
                                    setShowCarModal(false);
                                }}
                                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition duration-200"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showBatteryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Enter Battery Charge</h2>
                        <input
                            type="number"
                            className="w-full p-3 border rounded-lg mb-4"
                            value={currentCharge}
                            onChange={(e) => setCurrentCharge(e.target.value)}
                            min="0"
                            max="100"
                        />
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowBatteryModal(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowBatteryModal(false)}
                                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition duration-200"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;