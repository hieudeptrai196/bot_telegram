import { News } from '../models/news.model';
import { Standing } from '../models/standing.model';

export interface INotificationService {
  sendNewsUpdate(news: News[]): Promise<void>;
  sendStandings(standings: Standing[]): Promise<void>;
}

export const INotificationService = Symbol('INotificationService');
