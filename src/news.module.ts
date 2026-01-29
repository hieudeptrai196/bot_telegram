import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NewsController } from './presentation/controllers/news.controller';
import { BroadcastNewsUseCase } from './application/use-cases/broadcast-news.use-case';
import { GNewsService } from './infrastructure/services/gnews.service';
import { TelegramService } from './infrastructure/services/telegram.service';
import { INewsService } from './domain/interfaces/news-service.interface';
import { INotificationService } from './domain/interfaces/notification-service.interface';

@Module({
  imports: [HttpModule],
  controllers: [NewsController],
  providers: [
    BroadcastNewsUseCase,
    {
      provide: INewsService,
      useClass: GNewsService,
    },
    {
      provide: INotificationService,
      useClass: TelegramService,
    },
  ],
})
export class NewsModule {}
