//models/Api.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ApiSchema = new mongoose.Schema({
    name: { type: String, required: true },
    apiUrl: { type: String, required: true },
    version: { type: String, required: true },
    securityStatus: {
        type: String,
        enum: ['Secure', 'Insecure', 'Not Scanned'],
        required: true
    },
    description: String,
    owner: String,
    lastScanned: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Api', ApiSchema);
