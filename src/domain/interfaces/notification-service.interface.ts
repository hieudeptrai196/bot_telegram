import { MatchOdds } from '../models/match-odds.model';
import { Standing } from '../models/standing.model';
import { News } from '../models/news.model';
import { Email } from '../models/email.model';


export interface INotificationService {
  sendNewsUpdate(news: News[]): Promise<void>;
  sendStandings(standings: Standing[]): Promise<void>;
  sendOdds(odds: MatchOdds[]): Promise<void>;
  sendEmailUpdates(emails: Email[]): Promise<void>;
}

export const INotificationService = Symbol('INotificationService');
