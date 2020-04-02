import { IsNotEmpty } from 'class-validator';
import { PinEntity } from '../pin.interface';

export class PinDataStoreDto {
  @IsNotEmpty()
  readonly key: any;
  readonly data: PinEntity
}
