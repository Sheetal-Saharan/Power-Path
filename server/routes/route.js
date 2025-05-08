const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/getRoute', async (req, res) => {
    const { start_lat, start_long, pred_dist } = req.body;

    try {
        const response = await axios.post('http://127.0.0.1:8000/route_pred', {
            start_lat,
            start_long,
            pred_dist,
        });
        res.status(200).json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch route' });
    }
});

module.exports = router;
