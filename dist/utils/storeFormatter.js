"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNearbyStores = void 0;
const formatNearbyStores = (stores) => {
    stores.sort((a, b) => a.numericDistance - b.numericDistance);
    return stores.map((store) => {
        const { numericDistance, ...formattedStore } = store;
        return formattedStore;
    });
};
exports.formatNearbyStores = formatNearbyStores;
//# sourceMappingURL=storeFormatter.js.map