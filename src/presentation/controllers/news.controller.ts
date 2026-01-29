import { Controller, Get, Post } from '@nestjs/common';
import { BroadcastNewsUseCase } from '../../application/use-cases/broadcast-news.use-case';

@Controller('api/news')
export class NewsController {
  constructor(private readonly broadcastNewsUseCase: BroadcastNewsUseCase) {}

  @Get('broadcast')
  async broadcast() {
    return await this.broadcastNewsUseCase.execute();
  }
}
