import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from './location.dto';

/**
 * Representa uma loja física.
 */
export class StoreDto {
  /**
   * ID da loja
   * @example '67cb6061a9a283add117ff14'
   */
  _id: string;

  /**
   * Nome da loja
   * @example 'LLT Consultoria - Recife'
   */
  storeName: string;

  /**
   * CEP da loja
   * @example '50060004'
   */
  zipCode: string;

  /**
   * Logradouro da loja
   * @example 'Av. Conde da Boa Vista'
   */
  address: string;

  /**
   * Número do endereço
   * @example '171'
   */
  number: string;

  /**
   * Bairro da loja
   * @example 'Boa Vista'
   */
  neighborhood: string;

  /**
   * Cidade onde a loja está localizada
   * @example 'Recife'
   */
  city: string;

  /**
   * Estado onde a loja está localizada
   * @example 'Pernambuco'
   */
  state: string;

  /**
   * Telefone para contato
   * @example '+55(81)999999999'
   */
  phoneNumber: string;

  /**
   * Horário de funcionamento
   * @example 'Seg à Sáb: 09:00 às 18:00'
   */
  businessHour: string;

  /**
   * Tempo de preparo/postagem da loja em dias úteis
   * @example 1
   */
  shippingTimeInDays: number;

  /** Localização geográfica da loja */
  @ApiProperty({ type: () => LocationDto })
  location: LocationDto;
}
