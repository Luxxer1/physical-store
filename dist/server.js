"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_js_1 = __importDefault(require("./app.js"));
const appError_js_1 = __importDefault(require("./utils/appError.js"));
const logger_js_1 = __importDefault(require("./utils/logger.js"));
dotenv_1.default.config({ path: './config.env' });
if (!process.env.DATABASE_PASSWORD) {
    throw new appError_js_1.default('DATABASE_PASSWORD is not defined', 500);
}
const DB = process.env.DATABASE?.replace('<db_password>', process.env.DATABASE_PASSWORD);
if (!DB) {
    throw new appError_js_1.default('DATABASE URL is not defined or invalid', 500);
}
mongoose_1.default.connect(DB).then(() => logger_js_1.default.info('DB connection successful!'));
const port = process.env.PORT || 3000;
app_js_1.default.listen(port, () => {
    logger_js_1.default.info(`Server running at port ${port}`);
});
//# sourceMappingURL=server.js.map