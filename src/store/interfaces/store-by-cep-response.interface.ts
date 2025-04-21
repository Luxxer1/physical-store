export interface StoreResponse {
  name: string;
  city: string;
  postalCode: string;
  type: 'PDV' | 'LOJA';
  distance: string;
  shipping: {
    estimatedDelivery: string;
    price: number;
    description: string;
  }[];
}

export interface StorePin {
  position: {
    type: 'Point';
    coordinates: [number, number];
  };
  title: string;
}

export interface StoreByCepResponse {
  status: string;
  data: StoreResponse[];
  pins: StorePin[];
  limit: number;
  offset: number;
  total: number;
}
