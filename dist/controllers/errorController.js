"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const appError_1 = __importDefault(require("../utils/appError"));
const globalErrorHandler = (err, req, res, next) => {
    if (!(err instanceof appError_1.default)) {
        err = new appError_1.default('Algo deu errado!', 500);
    }
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
};
exports.globalErrorHandler = globalErrorHandler;
//# sourceMappingURL=errorController.js.map