class StoreFormatter {
  stores: any[];

  constructor(stores: any[]) {
    this.stores = stores;
  }

  sort() {
    this.stores.sort((a, b) => a.numericDistance - b.numericDistance);
    return this;
  }

  format() {
    return this.stores.map((store) => {
      const { numericDistance, ...formattedStore } = store;
      return formattedStore;
    });
  }
}

export default StoreFormatter;
