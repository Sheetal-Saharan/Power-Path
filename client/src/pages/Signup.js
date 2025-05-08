// Signup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/signup', { name, email, password });
            alert('Signup successful! Please log in.');
            navigate('/');
        } catch (err) {
            alert('Signup failed. Try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
            <form
                className="p-8 bg-white rounded-lg shadow-xl max-w-md w-full"
                onSubmit={handleSubmit}
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>
                <input
                    type="text"
                    placeholder="Name"
                    className="w-full p-3 mb-4 border rounded-lg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 mb-4 border rounded-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 mb-6 border rounded-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
    type="submit"
    className="bg-gradient-to-r from-green-400 to-blue-500 w-full py-3 rounded-lg text-white font-semibold hover:scale-105 transition-transform"
>
    Signup
</button>
                <div className='text-center my-2'>
                <p>New here?</p> <a href='/'>Login</a>
                </div>
            </form>
        </div>
    );
};

export default Signup;