import { MatchOdds } from '../models/match-odds.model';

export interface IOddsService {
  getOdds(): Promise<MatchOdds[]>;
}
export const IOddsService = Symbol('IOddsService');
