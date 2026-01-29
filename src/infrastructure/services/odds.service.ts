import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IOddsService } from '../../domain/interfaces/odds-service.interface';
import { MatchOdds } from '../../domain/models/match-odds.model';

@Injectable()
export class OddsService implements IOddsService {
  private readonly logger = new Logger(OddsService.name);
  private readonly baseUrl = 'https://api.the-odds-api.com/v4/sports';
  
  private readonly leagues = [
    { key: 'soccer_spain_la_liga', name: 'La Liga 🇪🇸' },
    { key: 'soccer_epl', name: 'Premier League 🇬🇧' },
    { key: 'soccer_uefa_champs_league', name: 'Champions League 🏆' },
  ];

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getOdds(): Promise<MatchOdds[]> {
    try {
      this.logger.log('Fetching Odds for multiple leagues...');
      const apiKey = this.configService.get<string>('ODDS_API_KEY')?.trim();
      
      if (!apiKey) {
        throw new Error('ODDS_API_KEY is not defined');
      }

      const requests = this.leagues.map(league => 
        firstValueFrom(
          this.httpService.get(`${this.baseUrl}/${league.key}/odds`, {
            params: {
              apiKey,
              regions: 'eu',
              markets: 'h2h',
              oddsFormat: 'decimal',
            },
          })
        ).then(response => {
           this.logger.log(`Fetched ${response.data.length} matches for ${league.name}`);
           return { leagueName: league.name, data: response.data };
        })
         .catch(err => {
            this.logger.error(`Error fetching ${league.name}`, err.message);
            return { leagueName: league.name, data: [] };
         })
      );

      const results = await Promise.all(requests);
      
      const allOdds: MatchOdds[] = [];
      results.forEach(result => {
        allOdds.push(...this.mapOdds(result.data, result.leagueName));
      });

      return allOdds;
    } catch (error) {
      this.logger.error('Error fetching odds', error.response?.data || error.message);
      throw error;
    }
  }

  private mapOdds(data: any[], leagueName: string): MatchOdds[] {
    return data.map((match) => {
      const bookmaker = match.bookmakers[0];
      if (!bookmaker) return null;

      const market = bookmaker.markets.find((m: any) => m.key === 'h2h');
      if (!market) return null;

      const home = market.outcomes.find((o: any) => o.name === match.home_team);
      const away = market.outcomes.find((o: any) => o.name === match.away_team);
      const draw = market.outcomes.find((o: any) => o.name === 'Draw');
      
      const homeOdd = home?.price || 0;
      const awayOdd = away?.price || 0;
      const drawOdd = draw?.price || 0;

      const advice = this.generateAdvice(homeOdd, drawOdd, awayOdd);

      return new MatchOdds(
        match.home_team,
        match.away_team,
        match.commence_time,
        bookmaker.title,
        homeOdd,
        drawOdd,
        awayOdd,
        leagueName,
        advice
      );
    }).filter((item) => item !== null) as MatchOdds[];
  }

  private generateAdvice(home: number, draw: number, away: number): string {
    if (home === 0 || away === 0) return 'Không có dữ liệu';
    
    // Simple logic based on odds difference
    if (home < 1.5) return '🔥 Kèo thơm: Chủ nhà thắng chắc!';
    if (away < 1.5) return '🔥 Kèo thơm: Khách thắng chắc!';
    
    if (home < 2.0 && home < away) return '✅ Khuyên chọn: Chủ nhà';
    if (away < 2.0 && away < home) return '✅ Khuyên chọn: Đội khách';
    
    if (Math.abs(home - away) < 0.5) return '⚖️ Trận này cân kèo, dễ Hòa';
    
    return '🤔 Kèo khó, cân nhắc kỹ';
  }
}
