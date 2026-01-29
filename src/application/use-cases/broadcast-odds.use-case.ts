import { Inject, Injectable, Logger } from '@nestjs/common';
import { IOddsService } from '../../domain/interfaces/odds-service.interface';
import { INotificationService } from '../../domain/interfaces/notification-service.interface';

@Injectable()
export class BroadcastOddsUseCase {
  private readonly logger = new Logger(BroadcastOddsUseCase.name);

  constructor(
    @Inject(IOddsService) private readonly oddsService: IOddsService,
    @Inject(INotificationService)
    private readonly notificationService: INotificationService,
  ) {}

  async execute(): Promise<any> {
    this.logger.log('Starting broadcast odds...');
    try {
      const odds = await this.oddsService.getOdds();

      if (odds.length === 0) {
        this.logger.log('No odds found.');
        return { message: 'No odds found' };
      }
      this.logger.log(`Found ${odds.length} matches with odds. Sending to Telegram...`);
      await this.notificationService.sendOdds(odds);
      this.logger.log('Broadcast odds completed successfully.');
      return {
        message: 'Broadcast odds completed successfully',
        count: odds.length,
      };
    } catch (error) {
      this.logger.error('Error broadcasting odds', error);
      throw error;
    }
  }
}
