"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearbyStores = exports.getAllStores = void 0;
const storeModel_1 = __importDefault(require("../models/storeModel"));
const node_fetch_1 = __importDefault(require("node-fetch"));
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
        res.status(400).json({
            status: 'fail',
            message: 'CEP inválido. O CEP deve ter exatamente 8 dígitos numéricos.',
        });
        return;
    }
    const cepResponse = await (0, node_fetch_1.default)(`https://viacep.com.br/ws/${cep}/json/`);
    if (!cepResponse.ok) {
        return next(new appError_1.default('Erro ao acessar a API do ViaCEP', 404));
    }
    const cepData = (await cepResponse.json());
    if (cepData.erro) {
        return next(new appError_1.default('CEP não encontrado.', 404));
    }
    console.log(cepData);
    res.status(200).json({
        status: 'success',
    });
});
//# sourceMappingURL=storeController.js.map