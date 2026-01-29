import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FootballService } from './infrastructure/services/football.service';
import { IFootballService } from './domain/interfaces/football-service.interface';
import { BroadcastStandingsUseCase } from './application/use-cases/broadcast-standings.use-case';
import { FootballController } from './presentation/controllers/football.controller';
import { INotificationService } from './domain/interfaces/notification-service.interface';
import { TelegramService } from './infrastructure/services/telegram.service';

@Module({
  imports: [HttpModule],
  controllers: [FootballController],
  providers: [
    BroadcastStandingsUseCase,
    {
       provide: IFootballService,
       useClass: FootballService
    },
    {
        provide: INotificationService,
        useClass: TelegramService
    },
    TelegramService
  ],
})
export class FootballModule {}
