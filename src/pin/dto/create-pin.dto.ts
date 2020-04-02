import { IsNotEmpty } from 'class-validator';

export class CreatePinDto {
  @IsNotEmpty()
  readonly url: string;

  @IsNotEmpty()
  readonly boardId: number;
}
