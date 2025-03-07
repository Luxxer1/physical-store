"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearbyStoresWithDistance = exports.calculateDistance = void 0;
const axios_1 = __importDefault(require("axios"));
const storeModel_1 = __importDefault(require("../models/storeModel"));
const appError_1 = __importDefault(require("../utils/appError"));
const MAX_DISTANCE_KM = 100;
const METERS_IN_KM = 1000;
const calculateDistance = async (origin, destination) => {
    const { data } = await axios_1.default.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${process.env.API_KEY}`);
    if (data.status !== 'OK' || !data.routes || !data.routes.length) {
        throw new appError_1.default('Não foi possível calcular a distância.', 500);
    }
    const distance = data.routes[0].legs[0].distance.value;
    return distance / METERS_IN_KM;
};
exports.calculateDistance = calculateDistance;
const getNearbyStoresWithDistance = async (origin) => {
    const stores = await storeModel_1.default.find();
    const nearbyStores = [];
    for (const store of stores) {
        if (store.location && store.location.coordinates) {
            const [storeLng, storeLat] = store.location.coordinates;
            const destination = `${storeLat},${storeLng}`;
            const distance = await (0, exports.calculateDistance)(origin, destination);
            if (distance <= MAX_DISTANCE_KM) {
                nearbyStores.push({
                    ...store.toObject(),
                    distance: `${distance} km`,
                    numericDistance: distance,
                });
            }
        }
    }
    return nearbyStores;
};
exports.getNearbyStoresWithDistance = getNearbyStoresWithDistance;
//# sourceMappingURL=storeService.js.map