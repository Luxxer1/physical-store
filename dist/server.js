"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const port = 3000;
app_js_1.default.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
//# sourceMappingURL=server.js.map