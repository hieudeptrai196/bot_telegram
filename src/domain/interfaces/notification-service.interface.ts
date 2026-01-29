import { News } from '../models/news.model';

export interface INotificationService {
  sendNewsUpdate(news: News[]): Promise<void>;
}

export const INotificationService = Symbol('INotificationService');
