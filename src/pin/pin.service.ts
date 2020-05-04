import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePinDto } from './dto/create-pin.dto';
import { Pin, PinRO } from './pin.interface';
import { PinDataStoreDto } from './dto/datestore-pin.dto';
import { Datastore } from '@google-cloud/datastore';
import axios from 'axios';
import * as url from 'url';
import { marketplaces } from './marketplaces.config';
import { DeletePinDto } from './dto/delete-pin.dto';


@Injectable()
export class PinService {

  datastore = new Datastore();



  kind = 'pin';

  async createPin(pinData: CreatePinDto): Promise<PinRO> {
    // TODO Validate the url and find which to send it to to scrape
    // findMarketplaceFromUrl(pinData.url);
    const parsedUrl = url.parse(pinData.url);
    const hostName = parsedUrl.host;

    // Verifying the board id Key
    console.log(`Checking board id with id ${pinData.boardId}`);
    const boardKey = this.datastore.key(["board", pinData.boardId]);
    const [boardEntity] = await this.datastore.get(boardKey);

    if (boardEntity === undefined) {
      throw new HttpException({ 'message': `No board with id ${pinData.boardId} found` }, HttpStatus.BAD_REQUEST);
    }

    const pinDataScraped: Pin = await this.scrapeUrlData(pinData.url);

    const pinKey = this.datastore.key(['board', pinData.boardId, this.kind]);

    const [pinEntity, newPinKey] = await this.savePinToDatastore(pinKey, pinDataScraped);
    console.log(newPinKey.path);
    // Return value to user
    const pin: Pin = {
      // @ts-ignore
      id: parseInt(newPinKey.path[3]),
      boardId: pinData.boardId,
      title: pinDataScraped.title,
      // eslint-disable-next-line @typescript-eslint/camelcase
      prodUrl: pinDataScraped.prodUrl,
      img: pinDataScraped.img,
      price: pinDataScraped.price,
      marketplace: pinDataScraped.marketplace,
      tags: pinEntity.tags
    };

    return PinService.buildApiRo(pin, 'Successfully created pin');
  }

  async deletePin(deletePinDto: DeletePinDto) {
    // const pinKey = this.datastore.key(['board', parseInt(pinData.boardId), this.kind]);
    console.log(deletePinDto);

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const pinKey = this.datastore.key(["board", parseInt(deletePinDto.boardId), 'pin', parseInt(deletePinDto.id)]);

    console.log('hi');
    const [pinEntity] = await this.datastore.get(pinKey);
    console.log(pinEntity);

    // console.log(pinEntity);
    pinEntity.isDeleted = true;

    await this.datastore.update(pinEntity);
    console.log(pinEntity);
    return { message: `Pin with id ${deletePinDto.id} from board ${deletePinDto.boardId} has been deleted :)` };

  }

  private static buildApiRo(pin: Pin, message: string): PinRO {
    return { message: message, data: pin };
  }

  async scrapeUrlData(url) {

    // scrapeUrl = 'https://us-central1-samcalamos-test.cloudfunctions.net/scrap-iconic';
    const scrapeUrl = process.env.SCRAPE_URL;

    console.log(`Calling cloud function with url ${url}`);
    console.log(`Cloud function url is ${scrapeUrl}`);
    const body = { url };


    const response = await axios.post(scrapeUrl, body)
      .catch(err => {
        if (err.response.status === 400) {
          throw new HttpException({ 'message': 'Unsupported Marketplace' }, HttpStatus.BAD_REQUEST);
        } else {
          throw new HttpException({ 'message': ['Unknown server error'] }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });

    return response.data;
  }


  async savePinToDatastore(pinKey, pinDataScraped) {
    const createDate = Date.now();


    const pinDto: PinDataStoreDto = {
      key: pinKey,
      data: {
        title: pinDataScraped.title,
        // eslint-disable-next-line @typescript-eslint/camelcase
        prod_url: pinDataScraped.prodUrl,
        img: pinDataScraped.img,
        price: pinDataScraped.price,
        createDate: createDate,
        marketplace: pinDataScraped.marketplace,
        isDeleted: false,
        tags: pinDataScraped.tags,
      },
    };

    const [entity] = await this.datastore.upsert(pinDto);
    console.log(`Saved product with name ${pinDto.data.title}`);

    console.log(pinKey.path);
    return [entity, pinKey];
  }

}


