const mongoose = require('mongoose');
const { Schema } = mongoose;

const SecuritySettingSchema = new Schema({
    authenticationMethod: { type: String, enum: ['basic-auth', 'oauth', 'jwt'], default: 'basic-auth' },
    twoFactorAuth: { type: Boolean, default: false }
});

module.exports = mongoose.model('SecuritySetting', SecuritySettingSchema);
