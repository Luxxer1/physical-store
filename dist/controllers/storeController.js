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
const distanceService_1 = require("../utils/distanceService");
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
    logger_1.default.info('Buscando lojas próximas...');
    const nearbyStores = [];
    for (const store of stores) {
        if (store.location && store.location.coordinates) {
            const [storeLng, storeLat] = store.location.coordinates;
            const destination = `${storeLat},${storeLng}`;
            const distance = await (0, distanceService_1.calculateDistance)(origin, destination);
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
//# sourceMappingURL=storeController.js.map