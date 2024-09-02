const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    apiName: { type: String, required: true },
    content: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
