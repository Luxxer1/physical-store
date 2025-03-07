"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistance = void 0;
const axios_1 = __importDefault(require("axios"));
const appError_1 = __importDefault(require("./appError"));
const calculateDistance = async (origin, destination) => {
    const { data } = await axios_1.default.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${process.env.API_KEY}`);
    if (data.status !== 'OK' || !data.routes || !data.routes.length) {
        throw new appError_1.default('Não foi possível calcular a distância.', 500);
    }
    const distance = data.routes[0].legs[0].distance.value;
    return distance / 1000;
};
exports.calculateDistance = calculateDistance;
//# sourceMappingURL=calculateDistance.js.map