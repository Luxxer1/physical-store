"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearbyStores = exports.getAllStores = void 0;
const storeModel_1 = __importDefault(require("../models/storeModel"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const getAllStores = async (req, res) => {
    const stores = await storeModel_1.default.find();
    res.status(200).json({
        status: 'success',
        data: {
            stores,
        },
    });
};
exports.getAllStores = getAllStores;
const getNearbyStores = async (req, res) => {
    let { cep } = req.params;
    if (!/^\d{8}$/.test(cep)) {
        res.status(400).json({
            status: 'error',
            message: 'CEP inválido. O CEP deve ter exatamente 8 dígitos numéricos.',
        });
        return;
    }
    try {
        const cepResponse = await (0, node_fetch_1.default)(`https://viacep.com.br/ws/${cep}/json/`);
        if (!cepResponse.ok) {
            res.status(404).json({
                status: 'error',
                message: 'Erro ao acessar a API do ViaCEP',
            });
            return;
        }
        const cepData = (await cepResponse.json());
        if (cepData.erro) {
            res.status(404).json({
                status: 'error',
                message: 'CEP não encontrado',
            });
            return;
        }
        console.log(cepData);
        res.status(200).json({
            status: 'success',
        });
    }
    catch (err) {
        res.status(500).json({
            status: 'error',
        });
    }
};
exports.getNearbyStores = getNearbyStores;
//# sourceMappingURL=storeController.js.map