const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['Administrator', 'User'], default: 'User' },
    apiKeys: [{ type: Schema.Types.ObjectId, ref: 'ApiKey' }]
});

module.exports = mongoose.model('User', UserSchema);
