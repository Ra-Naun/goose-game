import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { TapGooseGameService } from './tap-goose-game.service';
import { GameMatch, HistoryOfGameMatch } from './types';

@ApiTags('TapGooseGame')
@Controller('tap-goose-game')
export class TapGooseGameController {
  constructor(private readonly gameService: TapGooseGameService) { }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('matches/available')
  async getAvailableMatches(): Promise<GameMatch[]> {
    return this.gameService.getAvailableMatches();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('matches/history/user/:userId')
  async getUserMatchesHistory(
    @Param('userId') userId: string,
  ): Promise<HistoryOfGameMatch[]> {
    return this.gameService.getUserMatchesHistory(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('matches/history/match/:matchId')
  async getUserMatchHistory(
    @Param('matchId') matchId: string,
  ): Promise<HistoryOfGameMatch | null> {
    return this.gameService.getUserMatchHistory(matchId);
  }
}
