import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MailController } from './presentation/controllers/mail.controller';
import { BroadcastEmailsUseCase } from './application/use-cases/broadcast-emails.use-case';
import { VnptMailService } from './infrastructure/services/vnpt-mail.service';
import { TelegramService } from './infrastructure/services/telegram.service';
import { IMailService } from './domain/interfaces/mail-service.interface';
import { INotificationService } from './domain/interfaces/notification-service.interface';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [MailController],
  providers: [
    BroadcastEmailsUseCase,
    {
      provide: IMailService,
      useClass: VnptMailService,
    },
    {
      provide: INotificationService,
      useClass: TelegramService,
    },
  ],
})
export class MailModule {}
