import { Inject, Injectable, Logger } from '@nestjs/common';
import { INewsService } from '../../domain/interfaces/news-service.interface';
import { INotificationService } from '../../domain/interfaces/notification-service.interface';

@Injectable()
export class BroadcastNewsUseCase {
  private readonly logger = new Logger(BroadcastNewsUseCase.name);

  constructor(
    @Inject(INewsService) private readonly newsService: INewsService,
    @Inject(INotificationService)
    private readonly notificationService: INotificationService,
  ) {}

  async execute(): Promise<any> {
    this.logger.log('Starting broadcast news...');
    try {
      const news = await this.newsService.getTopHeadlines();
      if (news.length === 0) {
        this.logger.log('No news found.');
        return { message: 'No news found' };
      }
      this.logger.log(`Found ${news.length} articles. Sending to Telegram...`);
      await this.notificationService.sendNewsUpdate(news);
      this.logger.log('Broadcast completed successfully.');
      return {
        message: 'Broadcast completed successfully',
        count: news.length,
      };
    } catch (error) {
      this.logger.error('Error broadcasting news', error);
      throw error;
    }
  }
}
