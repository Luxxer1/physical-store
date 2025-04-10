import { Store } from '../schema/store.schema';

export class StoreByStateResponseDto {
  stores: Store[];
  limit: number;
  offset: number;
  total: number;
}
