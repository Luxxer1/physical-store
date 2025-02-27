"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var storeSchema = new mongoose_1.default.Schema({
    storeName: { type: String, required: true },
    zipCode: { type: String, required: true },
    address: { type: String, required: true },
    neighborhood: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    phoneNumber: { type: String },
    businessHour: { type: String },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
        },
    },
});
storeSchema.index({ 'location.coordinates': '2dsphere' });
exports.default = mongoose_1.default.model('Store', storeSchema);
