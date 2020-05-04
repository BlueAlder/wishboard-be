import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Datastore } from '@google-cloud/datastore';
import { Board } from './board.interface';
import { CreateBoardDto } from './dto/create-board.dto';
import { Pin } from '../pin/pin.interface';
import { PinService } from '../pin/pin.service';

@Injectable()
export class BoardService {
  constructor(private pinService: PinService) {

  }

  datastore = new Datastore();
  kind = 'board';
  // constructor() {}


  async getBoardById(boardId: number) {
    // Get board entity from data store
    // Create the key and retrieve the data from the server

    const [boardEntity, boardKey] = await this.findBoard(boardId);
    // console.log(boardEntity);

    // Build the board
    const boardData: Board = {
      id: boardId,
      name: boardEntity.name,
      lastUpdated: boardEntity.createDate,
      pins: [],
    };

    // Get the boards pins
    const [boardPins] = await  this.findPinsByBoard(boardKey);


    // Put the pins into the object
    boardPins.forEach(pin => {
      // console.log(pin[this.datastore.KEY].id);
      const pinData : Pin = {
        id: parseInt(pin[this.datastore.KEY].id),
        boardId: boardId,
        title: pin.title,
        img: pin.img,
        price: pin.price,
        // eslint-disable-next-line @typescript-eslint/camelcase
        prodUrl: pin.prod_url,
        marketplace: pin.marketplace,
        tags: pin.tags
      };
      boardData.pins.push(pinData);
    });


    // Return em all
    return BoardService.buildApiRO(boardData, 'Successfully got board');
  }

  async createBoard(boardData: CreateBoardDto) {
    // Create the key with the kind
    // boardData

    const boardKey = this.datastore.key(this.kind);
    const lastUpdated = Date.now();

    const board = {
      key: boardKey,
      data: {
        name: boardData.name,
        createDate: lastUpdated,
      },
    };
    const [entity] = await this.datastore.save(board);
    // ['board', '12345678']
    // console.log(boardKey.path);
    const boardId = boardKey.path[1];

    console.log(`Saved board with ID ${boardId}`);
    const newBoard: Board = {
      id: boardId,
      lastUpdated: lastUpdated,
      name: boardData.name,
      pins: [],
    };
    return BoardService.buildApiRO(newBoard, 'Successfully created board');
  }

  private static buildApiRO(board: Board, message: string) {
    return {message: message,  data: board}
  }


  async refreshBoard(boardId: number) {
  //  0. Validate board
    const [boardEntity, boardKey] = await this.findBoard(boardId);

  //  1. Retrieve the pins associated with the boards
    const [boardPins] = await this.findPinsByBoard(boardKey);

  //  2. Get the urls
  //   const pinURLS = boardPins.map(pin => pin.prod_url);
    // console.log(pinURLS);
    // return pinURLS;

  //  3. Call teh cloud function individualy with each url

    // Okay this is crazy, but basically we get a list of the Promises and then we await them to be fulfilled and then we return the board-
    const scrapePromises = boardPins.map((pin) => this.pinService.scrapeUrlData(pin.prod_url)
      .then((pinDataScraped) => {
          pinDataScraped.tags  = [...new Set([...pinDataScraped.tags, ...pin.tags])]
          console.log(pinDataScraped.tags)
          return this.pinService.savePinToDatastore(pin[this.datastore.KEY], pinDataScraped);
        }
      ));
    //  4. Update each pin
    // console.log(pin[this.datastore.KEY]);
    await Promise.all(scrapePromises);

    //update board last updated:
    boardEntity.createDate = Date.now();
    await this.datastore.save(boardEntity);

    return this.getBoardById(boardId);
  //  Return updated board details
  }

  async findBoard(boardId) {
    const boardKey = this.datastore.key([this.kind, boardId]);
    const [boardEntity] = await this.datastore.get(boardKey);
    // If board doesnt exist throw an error
    if (boardEntity === undefined) {
      throw new HttpException({message:`No board found with id ${boardId}`}, HttpStatus.BAD_REQUEST);
    }
    console.log(`Found board: ${boardEntity.name}`);
    return [boardEntity, boardKey];
  }

  async findPinsByBoard(boardKey) {
    const query = this.datastore.createQuery('pin').filter("isDeleted", "=", false).hasAncestor(boardKey);
    return  await this.datastore.runQuery(query);
  }
}
