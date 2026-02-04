import { Inject, Injectable, Logger } from '@nestjs/common';
import { IMailService } from '../../domain/interfaces/mail-service.interface';
import { INotificationService } from '../../domain/interfaces/notification-service.interface';
import { Email } from '../../domain/models/email.model';

@Injectable()
export class BroadcastEmailsUseCase {
  private readonly logger = new Logger(BroadcastEmailsUseCase.name);

  constructor(
    @Inject(IMailService)
    private readonly mailService: IMailService,
    @Inject(INotificationService)
    private readonly notificationService: INotificationService,
  ) {}

  async execute(): Promise<Email[]> {
    this.logger.log('Executing BroadcastEmailsUseCase');
    
    // 1. Fetch unread emails
    const emails = await this.mailService.getUnreadEmails();
    this.logger.log(`Fetched ${emails.length} emails`);

    // 2. Send notification (TelegramService will handle empty list message)
    await this.notificationService.sendEmailUpdates(emails);

    return emails;
  }
}
