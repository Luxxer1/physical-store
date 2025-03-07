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
const storeService_1 = require("../utils/storeService");
const storeFormatter_1 = __importDefault(require("../utils/storeFormatter"));
storeFormatter_1.default;
exports.getAllStores = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    logger_1.default.info('Buscando todas as lojas...');
    const stores = await storeModel_1.default.find().lean();
    if (stores.length === 0) {
        return next(new appError_1.default('Nenhuma loja encontrada', 404));
    }
    logger_1.default.info('Todas as lojas encontradas com sucesso.');
    const formattedStore = new storeFormatter_1.default(stores).format();
    res.status(200).json({
        status: 'success',
        data: {
            stores: formattedStore,
        },
    });
});
exports.getNearbyStores = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { cep } = req.params;
    if (!/^\d{8}$/.test(cep)) {
        return next(new appError_1.default('CEP inválido. O CEP deve ter exatamente 8 dígitos numéricos.', 400));
    }
    const { data: cepData } = await axios_1.default.get(`https://viacep.com.br/ws/${cep}/json/`);
    if (cepData.erro) {
        return next(new appError_1.default('CEP não encontrado.', 404));
    }
    const address = encodeURIComponent(`${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}, ${cepData.uf}`);
    if (!process.env.API_KEY) {
        return next(new appError_1.default('API KEY não definida', 500));
    }
    const { data: geocodeData } = await axios_1.default.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.API_KEY}`);
    if (!geocodeData.results || geocodeData.results.length === 0) {
        return next(new appError_1.default('Não foi possível obter as coordenadas do endereço.', 404));
    }
    const { lat, lng } = geocodeData.results[0].geometry.location;
    const origin = `${lat},${lng}`;
    logger_1.default.info(`Buscando lojas próximas ao CEP: ${cep}`);
    const nearbyStores = await (0, storeService_1.getNearbyStoresWithDistance)(origin);
    if (nearbyStores.length === 0) {
        return next(new appError_1.default(`Nenhuma loja encontrada próxima ao CEP: ${cep}`, 404));
    }
    const formattedStores = new storeFormatter_1.default(nearbyStores).sort().format();
    if (formattedStores.length === 1) {
        logger_1.default.info(`1 loja encontrada próxima ao CEP: ${cep}`);
    }
    else {
        logger_1.default.info(`${formattedStores.length} lojas encontradas próximas ao CEP: ${cep}`);
    }
    res.status(200).json({
        status: 'success',
        data: {
            stores: formattedStores,
        },
    });
});
//# sourceMappingURL=storeController.js.map