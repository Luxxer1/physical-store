import { StoreDto } from './store.dto';
import { PinDto } from './pin.dto';

export class StoreByCepResponseDto {
  stores: StoreDto[];
  pins: PinDto[];
  limit: number;
  offset: number;
  total: number;
}
