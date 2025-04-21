export interface MelhorEnvioResponse {
  id: number;
  name: string;
  price: string;
  custom_price: string;
  discount: string;
  currency: string;
  delivery_time: number;
  delivery_range: {
    min: number;
    max: number;
  };
  custom_delivery_time: number;
  custom_delivery_range: {
    min: number;
    max: number;
  };
  packages: Array<{
    price: string;
    discount: string;
    format: string;
    weight: string;
    insurance_value: string;
    dimensions: {
      height: number;
      width: number;
      length: number;
    };
  }>;
  additional_services: {
    receipt: boolean;
    own_hand: boolean;
    collect: boolean;
  };
  additional: {
    unit: {
      price: number;
      delivery: number;
    };
  };
  company: {
    id: number;
    name: string;
    picture: string;
  };
}
