const mongoose = require('mongoose');

// Define the Car schema
const carSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    maxDistance: {
        type: Number,
        required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Referencing User
});

// Export the Car model
module.exports = mongoose.model('Car', carSchema);
