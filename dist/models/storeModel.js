"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const storeSchema = new mongoose_1.default.Schema({
    storeName: String,
    zipCode: String,
    address: String,
    neighborhood: String,
    city: String,
    state: String,
    phoneNumber: String,
    businessHour: String,
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
});
exports.default = mongoose_1.default.model('Store', storeSchema);
//# sourceMappingURL=storeModel.js.map