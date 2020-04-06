export interface Pin {
  id: number;
  boardId: number;
  prodUrl: string;
  title: string;
  price: number;
  img: string;
}

export interface PinEntity {
  createDate: number;
  img: string;
  isDeleted: boolean;
  price: number;
  prod_url: string;
  title: string;
}

export interface PinRO {
  message: string;
  data: Pin;
}
