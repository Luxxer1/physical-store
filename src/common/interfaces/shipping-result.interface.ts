export interface ShippingOption {
  prazo: string;
  price: string;
  description: string;
}

export interface ShippingResult {
  type: 'PDV' | 'LOJA';
  value: ShippingOption[];
}
