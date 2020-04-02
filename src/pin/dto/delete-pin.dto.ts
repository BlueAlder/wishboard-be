import { IsNotEmpty } from 'class-validator';

export class DeletePinDto {
  @IsNotEmpty()
  readonly id: number;

  @IsNotEmpty()
  readonly boardId: string;
}
