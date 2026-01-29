import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { INotificationService } from '../../domain/interfaces/notification-service.interface';
import { News } from '../../domain/models/news.model';
import { Standing } from '../../domain/models/standing.model';
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
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN')?.trim();
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID')?.trim();

    if (!token) {
      throw new Error(
        'TELEGRAM_BOT_TOKEN is not defined in environment variables',
      );
    }
    if (!chatId) {
      throw new Error(
        'TELEGRAM_CHAT_ID is not defined in environment variables',
      );
    }

    this.token = token;
    this.chatId = chatId;
    this.apiUrl = `https://api.telegram.org/bot${this.token}/sendMessage`;
  }

  async sendNewsUpdate(newsList: News[]): Promise<void> {
    if (newsList.length === 0) return;

    let message = '<b>📢 TIN TỨC MỚI NHẤT</b>\n\n';

    newsList.forEach((news, index) => {
      message += `<b>${index + 1}. ${news.title}</b>\n`;
      if (news.description) {
        message += `${news.description}\n`;
      }
      const date = new Date(news.publishedAt).toLocaleDateString('vi-VN');
      message += `📅 ${date} • 📰 ${news.source} • <a href="${news.url}">Xem thêm</a>\n\n`;
    });

    try {
      this.logger.log(`Sending message to ${this.chatId}`);
      await firstValueFrom(
        this.httpService.post(this.apiUrl, {
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      );
      this.logger.log('Message sent successfully');
    } catch (error) {
      this.logger.error(
        'Error sending telegram message',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async sendStandings(standings: Standing[]): Promise<void> {
    if (standings.length === 0) return;

    let message = '<b>🇪🇸 BẢNG XẾP HẠNG LA LIGA MỚI NHẤT</b>\n\n';
    
    standings.forEach(s => {
       const position = s.position;
       let icon = '';
       if (position === 1) icon = '🥇';
       else if (position === 2) icon = '🥈';
       else if (position === 3) icon = '🥉';
       else icon = `${position}.`;

       message += `${icon} <b>${s.teamName.toUpperCase()}</b>\n`;
       message += `   🏆 ${s.points} điểm  •  🎮 ${s.playedGames} trận  •  🥅 ${s.goalDifference > 0 ? '+' : ''}${s.goalDifference}\n\n`;
    });

    try {
      this.logger.log(`Sending standings to ${this.chatId}`);
      await firstValueFrom(
        this.httpService.post(this.apiUrl, {
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      );
      this.logger.log('Standings sent successfully');
    } catch (error) {
      this.logger.error(
        'Error sending telegram standings',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
