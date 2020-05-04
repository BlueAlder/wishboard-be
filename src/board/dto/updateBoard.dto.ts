import { IsNotEmpty, IsNumber, MaxLength, MinLength } from 'class-validator';

export class UpdateBoardDto {
  @IsNotEmpty()
  @IsNumber()
  boardId: number;
}
