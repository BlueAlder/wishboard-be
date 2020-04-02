import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardController } from './board/board.controller';
import { BoardService } from './board/board.service';
import { PinController } from './pin/pin.controller';
import { PinService } from './pin/pin.service';

@Module({
  imports: [],
  controllers: [AppController, BoardController, PinController],
  providers: [AppService, BoardService, PinService],
})
export class AppModule {}
