export const formatNearbyStores = (stores: any[]): any[] => {
  stores.sort((a, b) => a.numericDistance - b.numericDistance);

  return stores.map((store) => {
    const { numericDistance, ...formattedStore } = store;
    return formattedStore;
  });
};
