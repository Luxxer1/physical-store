"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const appError_1 = __importDefault(require("./appError"));
const logger_1 = __importDefault(require("./logger"));
const globalErrorHandler = (err, req, res, next) => {
    if (!(err instanceof appError_1.default)) {
        err = new appError_1.default('Algo deu errado!', 500);
    }
    if (err.statusCode >= 500) {
        logger_1.default.error(`[${err.statusCode}] ${err.message} - ${req.method} ${req.originalUrl}`);
    }
    else {
        logger_1.default.warn(`[${err.statusCode}] ${err.message} - ${req.method} ${req.originalUrl}`);
    }
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
};
exports.globalErrorHandler = globalErrorHandler;
//# sourceMappingURL=errorHandler.js.map