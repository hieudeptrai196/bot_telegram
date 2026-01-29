import { Controller, Get, Post } from '@nestjs/common';
import { BroadcastStandingsUseCase } from '../../application/use-cases/broadcast-standings.use-case';

@Controller('api/football')
export class FootballController {
  constructor(
    private readonly broadcastStandingsUseCase: BroadcastStandingsUseCase,
  ) {}

  @Get('broadcast-laliga')
  @Post('broadcast-laliga')
  async broadcastLaLiga() {
    return this.broadcastStandingsUseCase.execute();
  }
}
