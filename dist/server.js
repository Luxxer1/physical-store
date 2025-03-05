"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_js_1 = __importDefault(require("./app.js"));
dotenv_1.default.config({ path: './config.env' });
if (!process.env.DATABASE_PASSWORD) {
    throw new Error('DATABASE_PASSWORD is not defined');
}
const DB = process.env.DATABASE?.replace('<db_password>', process.env.DATABASE_PASSWORD);
if (!DB) {
    throw new Error('DATABASE URL is not defined or invalid');
}
mongoose_1.default.connect(DB).then(() => console.log('DB connection successful!'));
const port = process.env.PORT || 3000;
app_js_1.default.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
//# sourceMappingURL=server.js.map