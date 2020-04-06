import { Body, Controller, Delete, Post } from '@nestjs/common';
import { PinService } from './pin.service';
import { CreatePinDto } from './dto/create-pin.dto';
import { DeletePinDto } from './dto/delete-pin.dto';

@Controller('pin')
export class PinController {
  constructor(private pinService: PinService){}

  @Post()
  async createPin(@Body() pinData: CreatePinDto) {
    try {
      return this.pinService.createPin(pinData);
    } catch (err) {
      console.error()
    }
  }

  @Delete()
  async deletePin(@Body() pinData: DeletePinDto) {
    try {
      return this.pinService.deletePin(pinData)
    }
    catch (e) {
      console.error('There was  an error deleting the pin :(');
      console.error(e);
      throw e;
    }
  }

}
