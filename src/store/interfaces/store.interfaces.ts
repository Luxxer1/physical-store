import { Store } from '../store.model';

export interface Coordinates {
  lat: number;
  lng: number;
}

export type StoreWithDistance = Store & {
  distance: string;
  numericDistance: number;
};
