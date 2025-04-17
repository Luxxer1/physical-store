import { IsString, Matches } from 'class-validator';

export class CepDto {
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, {
    message:
      'CEP inválido. Deve conter 8 dígitos numéricos, podendo ou não ter hífen.',
  })
  cep: string;
}
