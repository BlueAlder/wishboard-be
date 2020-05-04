import { Pin } from '../pin/pin.interface';

export interface Board {
  id: number | string;
  name: string;
  lastUpdated: number;
  pins: Pin[];
}

export interface ApiRO {
  data: Board;
}
