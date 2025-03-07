"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storeRoutes_1 = __importDefault(require("./routes/storeRoutes"));
const appError_1 = __importDefault(require("./utils/appError"));
const errorHandler_1 = require("./utils/errorHandler");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/stores', storeRoutes_1.default);
app.all('*', (req, res, next) => {
    next(new appError_1.default(`Não foi possível encontrar ${req.originalUrl} no servidor`, 404));
});
app.use(errorHandler_1.globalErrorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map