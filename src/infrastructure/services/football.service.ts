import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IFootballService } from '../../domain/interfaces/football-service.interface';
import { Standing } from '../../domain/models/standing.model';

@Injectable()
export class FootballService implements IFootballService {
  private readonly logger = new Logger(FootballService.name);
  // Using direct URL. User used cors-anywhere but for backend direct is better.
  // La Liga code is PD.
  private readonly apiUrl =
    'https://api.football-data.org/v4/competitions/PD/standings';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getLaLigaStandings(): Promise<Standing[]> {
    try {
      this.logger.log('Fetching La Liga Standings...');
      const token = this.configService.get<string>('FOOTBALL_API_TOKEN')?.trim();
      
      if (!token) {
        throw new Error('FOOTBALL_API_TOKEN is not defined in environment variables');
      }

      this.logger.debug(`Using token: ${token.substring(0, 4)}...`); // Debug log (masked)
      
      const response = await firstValueFrom(
        this.httpService.get(this.apiUrl, {
          headers: { 'X-Auth-Token': token },
        }),
      );

      // Structure: response.data.standings is array. Type="TOTAL" is what we want.
      // Usually the first element is TOTAL.
      const standingsData = response.data?.standings?.find((s: any) => s.type === 'TOTAL')?.table;

      if (!standingsData) {
        this.logger.warn('No standings data found');
        return [];
      }

      return standingsData.map((item: any) => new Standing(
        item.position,
        item.team.name,
        item.playedGames,
        item.won,
        item.draw,
        item.lost,
        item.points,
        item.goalsFor,
        item.goalsAgainst,
        item.goalDifference,
        item.team.crest
      ));
    } catch (error) {
      this.logger.error(
        'Error fetching standings',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
