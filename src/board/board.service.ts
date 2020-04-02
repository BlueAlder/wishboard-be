import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Datastore } from '@google-cloud/datastore';
import { Board } from './board.interface';
import { CreateBoardDto } from './dto/create-board.dto';
import { Pin } from '../pin/pin.interface';

@Injectable()
export class BoardService {
  datastore = new Datastore();
  kind = 'board';
  // constructor() {}


  async getBoardById(boardId: number) {
    // Get board entity from data store
    // Create the key and retrieve the data from the server
    const boardKey = this.datastore.key([this.kind, boardId]);
    const [boardEntity] = await this.datastore.get(boardKey);

    // If board doesnt exist throw an error
    if (boardEntity === undefined) {
      throw new HttpException({message:`No board found with id ${boardId}`}, HttpStatus.BAD_REQUEST);
    }

    console.log('Found board:');
    // console.log(boardEntity);

    // Build the board
    const boardData: Board = {
      id: boardId,
      name: boardEntity.name,
      pins: [],
    };

    // Get the boards pins
    const query = this.datastore.createQuery('pin').filter("isDeleted", "=", false).hasAncestor(boardKey);
    const [boardPins] = await this.datastore.runQuery(query);

    // Put the pins into the object
    boardPins.forEach(pin => {
      // console.log(pin[this.datastore.KEY].id);
      const pinData : Pin = {
        id: pin[this.datastore.KEY].id,
        boardId: boardId,
        title: pin.title,
        img: pin.img,
        price: pin.price,
        // eslint-disable-next-line @typescript-eslint/camelcase
        prodUrl: pin.prod_url,
      };
      console.log(pinData)
      boardData.pins.push(pinData);
    });


    // Return em all
    return BoardService.buildApiRO(boardData, 'Successfully got board');
  }

  async createBoard(boardData: CreateBoardDto) {
    // Create the key with the kind
    const boardKey = this.datastore.key(this.kind);
    const createDate = Date.now();

    const board = {
      key: boardKey,
      data: {
        name: boardData.name,
        createDate: createDate,
      },
    };
    const [entity] = await this.datastore.save(board);
    // ['board', '12345678']
    const boardId = boardKey.path[1];
    console.log(`Saved board with ID ${boardId}`);
    const newBoard: Board = {
      id: boardId,
      name: boardData.name,
      pins: [],
    };
    return BoardService.buildApiRO(newBoard, 'Successfully created board');
  }

  private static buildApiRO(board: Board, message: string) {
    return {message: message,  data: board}
  }


}
