import { Controller, Get, Post } from '@nestjs/common';
import { BroadcastOddsUseCase } from '../../application/use-cases/broadcast-odds.use-case';

@Controller('api/betting')
export class BettingController {
  constructor(
    private readonly broadcastOddsUseCase: BroadcastOddsUseCase,
  ) {}

  @Get('broadcast-odds')
  @Post('broadcast-odds')
  async broadcastOdds() {
    return this.broadcastOddsUseCase.execute();
  }
}
