export interface ShippingOption {
  estimatedDelivery: string;
  price: string;
  description: string;
}

export interface ShippingResult {
  type: 'PDV' | 'LOJA';
  shipping: ShippingOption[];
}
