export class ShippingOptionDto {
  /**
   * Prazo de entrega
   * @example '1 dia útil'
   */
  estimatedDelivery: string;

  /**
   * Valor do frete
   * @example '15.00'
   */
  price: number;

  /**
   * Descrição do serviço de frete
   * @example 'Motoboy'
   */
  description: string;
}
