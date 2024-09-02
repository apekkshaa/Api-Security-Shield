const mongoose = require('mongoose');
const { Schema } = mongoose;

const ApiKeySchema = new Schema({
    serviceName: { type: String, required: true },
    apiKey: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('ApiKey', ApiKeySchema);
