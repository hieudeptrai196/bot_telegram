import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { INewsService } from '../../domain/interfaces/news-service.interface';
import { News } from '../../domain/models/news.model';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GNewsService implements INewsService {
  private readonly logger = new Logger(GNewsService.name);
  private readonly apiUrl = 'https://gnews.io/api/v4/top-headlines';
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('GNEWS_API_KEY') ?? '';
  }

  async getTopHeadlines(): Promise<News[]> {
    try {
      // Using the parameters provided: general category, vi lang, vn country, max 3
      const url = `${this.apiUrl}?category=general&lang=vi&country=vn&max=3&apikey=${this.apiKey}`;
      this.logger.log(`Fetching news from ${url}`);
      
      const { data } = await firstValueFrom(this.httpService.get(url));
      
      if (!data.articles) {
        this.logger.warn('No articles found in response');
        return [];
      }

      return data.articles.map((article: any) => new News(
        article.title,
        article.description,
        article.url,
        article.source.name,
        article.publishedAt,
      ));
    } catch (error) {
      this.logger.error('Error fetching news from GNews', error.message);
      // In production, we might want to throw a custom domain exception
      throw error;
    }
  }
}
