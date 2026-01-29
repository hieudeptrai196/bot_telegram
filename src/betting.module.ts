import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { BettingController } from './presentation/controllers/betting.controller';
import { BroadcastOddsUseCase } from './application/use-cases/broadcast-odds.use-case';
import { OddsService } from './infrastructure/services/odds.service';
import { TelegramService } from './infrastructure/services/telegram.service';
import { IOddsService } from './domain/interfaces/odds-service.interface';
import { INotificationService } from './domain/interfaces/notification-service.interface';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [BettingController],
  providers: [
    BroadcastOddsUseCase,
    {
      provide: IOddsService,
      useClass: OddsService,
    },
    {
      provide: INotificationService,
      useClass: TelegramService,
    },
  ],
})
export class BettingModule {}
