import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { INotificationService } from '../../domain/interfaces/notification-service.interface';
import { News } from '../../domain/models/news.model';
import { Standing } from '../../domain/models/standing.model';
import { MatchOdds } from '../../domain/models/match-odds.model';
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
       message += `🏆 ${s.points} điểm  •  🎮 ${s.playedGames} trận  •  🥅 ${s.goalDifference > 0 ? '+' : ''}${s.goalDifference}\n\n`;
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

  async sendOdds(odds: MatchOdds[]): Promise<void> {
    if (odds.length === 0) return;

    // Group odds by league
    const oddsByLeague: { [key: string]: MatchOdds[] } = {};
    odds.forEach((match) => {
      if (!oddsByLeague[match.league]) {
        oddsByLeague[match.league] = [];
      }
      oddsByLeague[match.league].push(match);
    });

    // Send one message per league
    for (const leagueName of Object.keys(oddsByLeague)) {
      let message = `<b>🎱 TỶ LỆ KÈO ${leagueName.toUpperCase()}</b>\n\n`;
      const leagueOdds = oddsByLeague[leagueName];

      leagueOdds.forEach((match) => {
        const date = new Date(match.commenceTime).toLocaleString('vi-VN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });

        message += `⚽ <b>${match.homeTeam} vs ${match.awayTeam}</b>\n`;
        message += `🕒 <i>${date}</i>\n`;
        
        if (match.homeOdd && match.drawOdd && match.awayOdd) {
           message += `1️⃣ Chủ: ${match.homeOdd} | ✖️ Hòa: ${match.drawOdd} | 2️⃣ Khách: ${match.awayOdd}\n`;
           message += `${match.advice}\n`;
        } else {
           message += `⚠️ Chưa có tỷ lệ đầy đủ\n`;
        }
        message += `🏦 <i>${match.bookmaker}</i>\n\n`;
      });

      try {
        this.logger.log(`Sending odds for ${leagueName} to ${this.chatId}`);
        await firstValueFrom(
          this.httpService.post(this.apiUrl, {
            chat_id: this.chatId,
            text: message,
            parse_mode: 'HTML',
          }),
        );
        this.logger.log(`Odds for ${leagueName} sent successfully`);
      } catch (error) {
        this.logger.error(
          `Error sending odds for ${leagueName}`,
          error.response?.data || error.message,
        );
        // Continue sending other leagues even if one fails
      }
    }
  }
}
