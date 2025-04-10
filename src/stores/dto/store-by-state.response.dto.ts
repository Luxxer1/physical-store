import { StoreEntity } from '../entities/store.entity';

export class StoreByStateResponseDto {
  stores: StoreEntity[];
  limit: number;
  offset: number;
  total: number;
}
