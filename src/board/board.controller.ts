import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BoardService } from './board.service';
import { Board, ApiRO } from './board.interface';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/updateBoard.dto';

@Controller('board')
export class BoardController {

  constructor(private readonly boardService: BoardService) {
  }

  @Get(':id')
  async getBoardById(@Param() params): Promise<ApiRO> {
    try {
      const boardId = parseInt(params.id);
      return await this.boardService.getBoardById(boardId);
    } catch (e) {
      console.error('There was an error getting the board');
      console.error(e);
      throw e;
    }
  }

  @Post()
  async createBoard(@Body() boardData: CreateBoardDto) {
    return this.boardService.createBoard(boardData);
  }

  @Post('/update')
  async refreshBoard(@Body() boardData: UpdateBoardDto) {//Promise<ApiRO> {
    try {
      const boardId = boardData.boardId;
      return await this.boardService.refreshBoard(boardId)
    } catch (e) {
      console.error("There was an error updating the board");
      console.error(e);
      throw e;
    }
  }

}
