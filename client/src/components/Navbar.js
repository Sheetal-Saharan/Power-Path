import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUserCircle } from 'react-icons/fa';
import { AiOutlineLogout } from 'react-icons/ai';


const Navbar = () => {
    const location = useLocation();
    const isVisible = location.pathname === '/home' || location.pathname === '/profile';

    if (!isVisible) return null;

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 shadow-md fixed w-full z-50">
    <div className="container mx-auto flex justify-between items-center px-6">
        <h1 className="text-2xl font-bold">🚗 EV Finder</h1>
        <div className="flex items-center gap-6">
            <Link
                to="/home"
                className="flex items-center gap-2 hover:text-yellow-300 transition duration-200"
            >
                <FaHome /> Home
            </Link>
            <Link
                to="/profile"
                className="flex items-center gap-2 hover:text-yellow-300 transition duration-200"
            >
                <FaUserCircle /> Profile
            </Link>
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
            >
                <AiOutlineLogout /> Logout
            </button>
        </div>
    </div>
</nav>
    );
};

export default Navbar;
