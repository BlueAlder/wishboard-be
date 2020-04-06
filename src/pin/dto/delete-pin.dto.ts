import { IsInt, IsNotEmpty } from 'class-validator';

export class DeletePinDto {
  @IsNotEmpty()
  @IsInt()
  readonly id: number;

  @IsNotEmpty()
  @IsInt()
  readonly boardId: number;
}
