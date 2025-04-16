export interface StoreResponse {
  name: string;
  city: string;
  postalCode: string;
  type: 'PDV' | 'LOJA';
  distance: string;
  value: {
    prazo: string;
    price: string;
    description: string;
  }[];
}

export interface StorePin {
  position: {
    lat: number | undefined;
    lng: number | undefined;
  };
  title: string;
}

export interface StoreByCepResponse {
  stores: StoreResponse[];
  pins: StorePin[];
  limit: number;
  offset: number;
  total: number;
}
