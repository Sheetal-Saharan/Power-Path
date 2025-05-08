const express = require('express');
const Car = require('../models/Car');
const mongoose = require('mongoose');
const router = express.Router();

// Add a car
router.post('/add', async (req, res) => {
    const { name, maxDistance, userId } = req.body;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        const car = new Car({ name, maxDistance, user: userId });
        await car.save();
        res.status(201).json(car);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add car' });
    }
});

// Get cars by user
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        const cars = await Car.find({ user: userId });
        res.status(200).json(cars);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch cars' });
    }
});

module.exports = router;