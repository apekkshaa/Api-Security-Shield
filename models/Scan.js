//models/Scan.js
const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
    apiId: { type: mongoose.Schema.Types.ObjectId, ref: 'Api', required: true },
    apiName: String,
    outcome: String,
    vulnerabilities: Array,
    scanResults: Array,
    summary: String,
    scanDate: { type: Date, default: Date.now },
    scanDepth: { type: String },
    owaspTop10: [{ type: String }],
});

module.exports = mongoose.model('Scan', scanSchema);
