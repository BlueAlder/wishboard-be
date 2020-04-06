import { IsInt, IsNotEmpty, IsUrl } from 'class-validator';

export class CreatePinDto {
  @IsNotEmpty()
  @IsUrl()
  readonly url: string;

  @IsNotEmpty()
  @IsInt()
  readonly boardId: number;
}
