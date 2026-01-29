import { News } from '../models/news.model';

export interface INewsService {
  getTopHeadlines(): Promise<News[]>;
}

export const INewsService = Symbol('INewsService');
