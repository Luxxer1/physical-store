"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const storeSchema = new mongoose_1.default.Schema({
    storeName: { type: String, required: true },
    zipCode: { type: String, required: true },
    address: { type: String, required: true },
    neighborhood: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    phoneNumber: { type: String },
    businessHour: { type: String },
    location: {
        longitude: { type: Number, required: true },
        latitude: { type: Number, required: true },
    },
});
exports.default = mongoose_1.default.model('Store', storeSchema);
//# sourceMappingURL=storeModel.js.map