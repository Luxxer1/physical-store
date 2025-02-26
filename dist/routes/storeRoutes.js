"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storeController_1 = require("../controllers/storeController");
const router = express_1.default.Router();
router.route('/').get(storeController_1.getAllStores);
exports.default = router;
//# sourceMappingURL=storeRoutes.js.map