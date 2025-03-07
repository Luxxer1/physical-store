"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearbyStores = exports.getAllStores = void 0;
const axios_1 = __importDefault(require("axios"));
const storeModel_1 = __importDefault(require("../models/storeModel"));
const appError_1 = __importDefault(require("../utils/appError"));
const catchAsync_1 = require("../utils/catchAsync");
const logger_1 = __importDefault(require("../utils/logger"));
exports.getAllStores = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const stores = await storeModel_1.default.find();
    logger_1.default.info('Buscando todas as lojas...');
    res.status(200).json({
        status: 'success',
        data: {
            stores,
        },
    });
});
exports.getNearbyStores = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    let { cep } = req.params;
    if (!/^\d{8}$/.test(cep)) {
        return next(new appError_1.default('CEP inválido. O CEP deve ter exatamente 8 dígitos numéricos.', 400));
    }
    const { data: cepData } = await axios_1.default.get(`https://viacep.com.br/ws/${cep}/json/`);
    if (cepData.erro) {
        return next(new appError_1.default('CEP não encontrado.', 404));
    }
    console.log(cepData);
    const address = encodeURIComponent(`
      ${cepData.logradouro},
      ${cepData.bairro},
      ${cepData.localidade},
      ${cepData.uf}
    `);
    if (!process.env.API_KEY) {
        throw new Error('API KEY is not defined');
    }
    const { data: geocodeData } = await axios_1.default.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.API_KEY}`);
    if (!geocodeData.results || geocodeData.results.length === 0) {
        return next(new appError_1.default('Não foi possível obter as coordenadas do endereço.', 404));
    }
    const { lat, lng } = geocodeData.results[0].geometry.location;
    const origin = `${lat},${lng}`;
    const stores = await storeModel_1.default.find();
    const nearbyStores = [];
    for (const store of stores) {
        if (store.location && store.location.coordinates) {
            const [storeLng, storeLat] = store.location.coordinates;
            const destination = `${storeLat},${storeLng}`;
            const distance = await calculateDistance(origin, destination);
            if (distance <= 100) {
                nearbyStores.push({
                    ...store.toObject(),
                    distance: `${distance} km`,
                    numericDistance: distance,
                });
            }
        }
    }
    nearbyStores.sort((a, b) => a.numericDistance - b.numericDistance);
    nearbyStores.forEach((store) => {
        const storeOptionalFields = store;
        delete storeOptionalFields.numericDistance;
    });
    res.status(200).json({
        status: 'success',
        data: {
            stores: nearbyStores,
        },
    });
});
const calculateDistance = async (origin, destination) => {
    const { data } = await axios_1.default.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${process.env.API_KEY}`);
    if (data.status !== 'OK' || !data.routes || !data.routes.length) {
        throw new Error('Não foi possível calcular a distância.');
    }
    const distance = data.routes[0].legs[0].distance.value;
    return distance / 1000;
};
//# sourceMappingURL=storeController.js.map