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
exports.getAllStores = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const stores = await storeModel_1.default.find();
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
    console.log(geocodeData);
    res.status(200).json({
        status: 'success',
    });
});
//# sourceMappingURL=storeController.js.map