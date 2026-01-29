import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { INotificationService } from '../../domain/interfaces/notification-service.interface';
import { News } from '../../domain/models/news.model';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TelegramService implements INotificationService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly token: string;
  private readonly chatId: string;
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.token = this.configService.get<string>('TELEGRAM_BOT_TOKEN') ?? '';
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID') ?? '';
    this.apiUrl = `https://api.telegram.org/bot${this.token}/sendMessage`;
  }

  async sendNewsUpdate(newsList: News[]): Promise<void> {
    if (newsList.length === 0) return;

    let message = '<b>📢 Tin tức mới nhất:</b>\n\n';
    
    newsList.forEach((news, index) => {
        message += `<b>${index + 1}. ${news.title}</b>\n`;
        // Format date slightly if possible, but keeping it simple for now
        const date = new Date(news.publishedAt).toLocaleDateString('vi-VN');
        message += `<i>${date}</i> - ${news.source}\n`;
        message += `<a href="${news.url}">Đọc tiếp...</a>\n\n`;
    });

    try {
      this.logger.log(`Sending message to ${this.chatId}`);
      await firstValueFrom(this.httpService.post(this.apiUrl, {
        chat_id: this.chatId,
        text: message,
        parse_mode: 'HTML',
      }));
      this.logger.log('Message sent successfully');
    } catch (error) {
        this.logger.error('Error sending telegram message', error.response?.data || error.message);
        throw error;
    }
  }
}
