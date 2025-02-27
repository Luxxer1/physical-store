"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearbyStores = exports.getAllStores = void 0;
const storeModel_1 = __importDefault(require("../models/storeModel"));
const getAllStores = async (req, res) => {
    const stores = await storeModel_1.default.find();
    console.log(stores);
    res.status(200).json({
        status: 'success',
    });
};
exports.getAllStores = getAllStores;
const getNearbyStores = async (req, res) => { };
exports.getNearbyStores = getNearbyStores;
//# sourceMappingURL=storeController.js.map