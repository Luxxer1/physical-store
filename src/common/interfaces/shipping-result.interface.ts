export interface ShippingOption {
  estimatedDelivery: string;
  price: number;
  description: string;
}

export interface ShippingResult {
  type: 'PDV' | 'LOJA';
  shipping: ShippingOption[];
}
