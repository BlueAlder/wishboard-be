export interface Pin {
  id: number;
  boardId: number;
  prodUrl: string;
  title: string;
  price: number;
  img: string;
  marketplace: string;
  tags: string[];
  // createDate: string;
}

export interface PinEntity {
  createDate: number;
  img: string;
  isDeleted: boolean;
  price: number;
  prod_url: string;
  title: string;
  marketplace: string;
  tags: string[];
}

export interface PinRO {
  message: string;
  data: Pin;
}
