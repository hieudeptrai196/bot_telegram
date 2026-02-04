import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IMailService } from '../../domain/interfaces/mail-service.interface';
import { Email } from '../../domain/models/email.model';

@Injectable()
export class VnptMailService implements IMailService {
  private readonly logger = new Logger(VnptMailService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getUnreadEmails(): Promise<Email[]> {
    const url = this.configService.get<string>('VNPT_EMAIL_URL');
    const username = this.configService.get<string>('VNPT_EMAIL_USER');
    const password = this.configService.get<string>('VNPT_EMAIL_PASS');

    if (!url || !username || !password) {
      this.logger.error('Missing VNPT email configuration');
      throw new Error('Missing VNPT email configuration');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          auth: {
            username,
            password,
          },
        }),
      );
      return this.mapVnptResponse(response.data);
    } catch (error: any) {
      this.logger.error('Error fetching emails from VNPT', error.message);
      if (error.response) {
        this.logger.error(
          `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`,
        );
      }
      throw error;
    }
  }

  private mapVnptResponse(data: VnptMailResponse): Email[] {
    if (!data || !data.m) {
      return [];
    }

    return data.m.map((msg) => {
      const senderEntity = msg.e.find((e) => e.t === 'f');
      return {
        id: msg.id,
        subject: msg.su,
        snippet: msg.fr,
        sender: senderEntity ? `${senderEntity.d} <${senderEntity.a}>` : 'Unknown',
        receivedAt: new Date(msg.d),
      };
    });
  }
}

interface VnptMailResponse {
  m: VnptMailMessage[];
}

interface VnptMailMessage {
  id: string;
  su: string;
  fr: string;
  d: number;
  e: VnptMailEntity[];
}

interface VnptMailEntity {
  a: string;
  d: string;
  t: string;
}
