import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NewsModule } from './news.module';
import { FootballModule } from './football.module';
import { BettingModule } from './betting.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    NewsModule,
    FootballModule,
    BettingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
