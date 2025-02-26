"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllStores = void 0;
const getAllStores = (req, res) => {
    console.log('hello from controller');
    res.status(200).json({
        status: 'success',
    });
};
exports.getAllStores = getAllStores;
//# sourceMappingURL=storeController.js.map