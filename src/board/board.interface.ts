import { Pin } from '../pin/pin.interface';

export interface Board {
  id: number | string;
  name: string;
  pins: Pin[];
}

export interface ApiRO {
  data: Board;
}
