const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    incidentType: String,
    incidentDate: { type: Date, default: Date.now },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    description: String,
    resolved: { type: Boolean, default: false }
});

module.exports = mongoose.model('Incident', IncidentSchema);