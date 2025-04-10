import { Store } from '../schema/store.schema';

export class ListAllResponseDto {
  stores: Store[];
  limit: number;
  offset: number;
  total: number;
}
