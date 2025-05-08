import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCar } from "react-icons/fa";
import Modal from "react-modal";

const customStyles = {
  content: {
    top: '54%',
    left: '50%',
    right: '500%',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

Modal.setAppElement('#root');

const Profile = () => {
    const [cars, setCars] = useState([]);
    const [name, setName] = useState('');
    const [maxDistance, setMaxDistance] = useState('');
    const [selectedCar, setSelectedCar] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [terminalVoltage, setTerminalVoltage] = useState('');
    const [terminalCurrent, setTerminalCurrent] = useState('');
    const [temperature, setTemperature] = useState('');
    const [chargeCurrent, setChargeCurrent] = useState('');
    const [chargeVoltage, setChargeVoltage] = useState('');
    const [capacity, setCapacity] = useState('');
    const [cycle, setCycle] = useState('');
    const [sohResult, setSohResult] = useState('');

    const FillDummyData = async () => {
        setTerminalVoltage('3.70')
        setTerminalCurrent('0.00')
        setTemperature('25.00')
        setChargeCurrent('1.00')
        setChargeVoltage('4.20')
        setCapacity('2.50')
        setCycle('100')
    }

    useEffect(() => {
        const fetchCars = async () => {
            const userId = localStorage.getItem('userId');
            try {
                const res = await axios.get(`http://localhost:5000/api/car/${userId}`);
                setCars(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCars();
    }, []);

    const addCar = async () => {
        const userId = localStorage.getItem('userId');
        try {
            const res = await axios.post('http://localhost:5000/api/car/add', {
                name,
                maxDistance,
                userId,
            });
            setCars([...cars, res.data]);
            setName('');
            setMaxDistance('');
        } catch (err) {
            console.error(err);
        }
    };

    const openModal = (car) => {
        setSelectedCar(car);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    

    const handlePredictSoh = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/predict_soh', {
                params: {
                    terminal_voltage: terminalVoltage,
                    terminal_current: terminalCurrent,
                    temperature,
                    charge_current: chargeCurrent,
                    charge_voltage: chargeVoltage,
                    capacity,
                    cycle,
                }
            });
            setSohResult(`Predicted SOH: ${response.data.soh}`);
        } catch (error) {
            console.error('Error fetching SOH:', error);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
            <header className="py-6 text-center">
                <h1 className="text-3xl font-bold">Profile</h1>
            </header>

            <div className="p-6 max-w-4xl mx-auto">
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Add a New Car</h2>
                    <input
                        type="text"
                        placeholder="Car Name"
                        className="w-full p-3 mb-4 border rounded-lg"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Max Distance (km)"
                        className="w-full p-3 mb-4 border rounded-lg"
                        value={maxDistance}
                        onChange={(e) => setMaxDistance(e.target.value)}
                    />
                    <button
                        onClick={addCar}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
                    >
                        Add Car
                    </button>
                </section>

                <section className="">
    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Your Cars</h2>
    <div className="grid grid-cols-3">
        {cars.map((car) => (
            <div
                key={car._id}
                className="flex cursor-pointer justify-between items-center my-auto bg-white hover:bg-sky-50 w-fit p-4 rounded-lg shadow-md hover:shadow-lg transition"
                onClick={() => openModal(car)}
            >
                <span className="text-gray-700 font-medium flex"> <FaCar className='my-auto mx-2' /> {car.name} - {car.maxDistance} km</span>
             
            </div>
        ))}
    </div>
</section>
<Modal
    isOpen={modalIsOpen}
    onRequestClose={closeModal}
    style={customStyles}
    contentLabel="Car Details Modal"
>
    <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{selectedCar?.name}</h2>
        <form className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Terminal Voltage (V):
                </label>
                <input
                    type="number"
                    value={terminalVoltage}
                    onChange={(e) => setTerminalVoltage(e.target.value)}
                    placeholder="Enter Terminal Voltage"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Terminal Current (A):
                </label>
                <input
                    type="number"
                    value={terminalCurrent}
                    onChange={(e) => setTerminalCurrent(e.target.value)}
                    placeholder="Enter Terminal Current"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Temperature (°C):
                </label>
                <input
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="Enter Temperature"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Charge Current (A):
                </label>
                <input
                    type="number"
                    value={chargeCurrent}
                    onChange={(e) => setChargeCurrent(e.target.value)}
                    placeholder="Enter Charge Current"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Charge Voltage (V):
                </label>
                <input
                    type="number"
                    value={chargeVoltage}
                    onChange={(e) => setChargeVoltage(e.target.value)}
                    placeholder="Enter Charge Voltage"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Battery Capacity (Ah):
                </label>
                <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Enter Battery Capacity"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Cycle Number:
                </label>
                <input
                    type="number"
                    value={cycle}
                    onChange={(e) => setCycle(e.target.value)}
                    placeholder="Enter Cycle Number"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
            </div>
            <button
                type="button"
                onClick={FillDummyData}
                className=" bg-green-500 mx-5 w-fit hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Fill Data
            </button>
            <button
                type="button"
                onClick={handlePredictSoh}
                className="w-fit bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Predict SOH
            </button>
        </form>

        {sohResult && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
                {sohResult}
            </div>
        )}
    </div>
</Modal>

            </div>
        </div>
    );
};

export default Profile;