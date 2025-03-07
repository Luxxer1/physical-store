"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StoreFormatter {
    stores;
    constructor(stores) {
        this.stores = stores;
    }
    sort() {
        this.stores.sort((a, b) => a.numericDistance - b.numericDistance);
        return this;
    }
    format() {
        return this.stores.map((store) => {
            const { _id, location, __v, numericDistance, ...formattedStore } = store;
            return formattedStore;
        });
    }
}
exports.default = StoreFormatter;
//# sourceMappingURL=storeFormatter.js.map