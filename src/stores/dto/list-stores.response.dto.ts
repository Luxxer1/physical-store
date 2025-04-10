import { StoreEntity } from '../entities/store.entity';

export class ListAllResponseDto {
  stores: StoreEntity[];
  limit: number;
  offset: number;
  total: number;
}
