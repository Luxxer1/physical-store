import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class CepDto {
  @ApiProperty({
    example: '12345-678',
    description: 'CEP brasileiro com ou sem hífen. Ex: 12345678 ou 12345-678',
  })
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, {
    message:
      'CEP inválido. Deve conter 8 dígitos numéricos, podendo ou não ter hífen.',
  })
  cep: string;
}
