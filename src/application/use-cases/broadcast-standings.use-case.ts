import { Inject, Injectable, Logger } from '@nestjs/common';
import { IFootballService } from '../../domain/interfaces/football-service.interface';
import { INotificationService } from '../../domain/interfaces/notification-service.interface';

@Injectable()
export class BroadcastStandingsUseCase {
  private readonly logger = new Logger(BroadcastStandingsUseCase.name);

  constructor(
    @Inject(IFootballService) private readonly footballService: IFootballService,
    @Inject(INotificationService)
    private readonly notificationService: INotificationService,
  ) {}

  async execute(): Promise<any> {
    this.logger.log('Starting broadcast standings...');
    try {
      const standings = await this.footballService.getLaLigaStandings();

      if (standings.length === 0) {
        this.logger.log('No standings found.');
        return { message: 'No standings found' };
      }
      this.logger.log(`Found standings. Sending to Telegram...`);
      await this.notificationService.sendStandings(standings);
      this.logger.log('Broadcast standings completed successfully.');
      return {
        message: 'Broadcast standings completed successfully',
        count: standings.length,
      };
    } catch (error) {
      this.logger.error('Error broadcasting standings', error);
      throw error;
    }
  }
}
