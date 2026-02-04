import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { BroadcastEmailsUseCase } from '../../application/use-cases/broadcast-emails.use-case';

@Controller('api/mail')
export class MailController {
  constructor(private readonly broadcastEmailsUseCase: BroadcastEmailsUseCase) {}

  @Get('unread')
  async getUnreadEmails() {
  try {
    const data = await this.broadcastEmailsUseCase.execute();
    if (!data || data.length === 0) {
      return {
        success: true,
        message: 'No unread emails found',
        count: 0
      };
    }

    return {
      success: true,
      message: `Successfully processed ${data.length} emails`,
      count: data.length
    };

  } catch (error: any) {
    if (error instanceof HttpException) {
      throw error;
    }

    throw new HttpException(
      error.message || 'Internal Server Error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
}
