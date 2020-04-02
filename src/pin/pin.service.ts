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

  // scrapeUrl = 'https://us-central1-samcalamos-test.cloudfunctions.net/scrap-iconic';
  scrapeUrl = 'http://127.0.0.1:8080';

  kind = 'pin';

  async createPin(pinData: CreatePinDto): Promise<PinRO> {
    // TODO Validate the url and find which to send it to to scrape
    // findMarketplaceFromUrl(pinData.url);
    const parsedUrl = url.parse(pinData.url);
    const hostName = parsedUrl.host;


    console.log(`Calling cloud function with url ${pinData.url}`);
    console.log(`Cloud function url is ${this.scrapeUrl}`);
    const body = { url: pinData.url };
    const response = await axios.post(this.scrapeUrl, body);
    const pinDataScraped: Pin = response.data;

    const pinKey = this.datastore.key(['board', pinData.boardId, this.kind]);
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
        isDeleted: false,
      },
    };

    const entity = await this.datastore.save(pinDto);
    console.log(`Saved product with name ${pinDto.data.title}`);

    // Return value to user
    const pin: Pin = {
      id: pinKey.path[0],
      boardId: pinData.boardId,
      title: pinDataScraped.title,
      // eslint-disable-next-line @typescript-eslint/camelcase
      prodUrl: pinDataScraped.prodUrl,
      img: pinDataScraped.img,
      price: pinDataScraped.price,
    };

    return PinService.buildApiRo(pin, 'Succesfully created pin');
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
    pinEntity.isDeleted = true;

    await this.datastore.update(pinEntity);
    console.log(pinEntity);
    return { message: `Pin with id ${deletePinDto.id} from board ${deletePinDto.boardId} has been deleted :)` };

  }

  private static buildApiRo(pin: Pin, message: string): PinRO {
    return { message: message, data: pin };
  }

}


