import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { TapGooseGameService } from './tap-goose-game.service';
import { ActiveMatchIsEnded, HistoryOfGooseGameMatch } from './types';
import type { JwtRequest } from 'src/types/request-user';
import { GooseGameMatchDto } from './dto';

@ApiTags('TapGooseGame')
@Controller('tap-goose-game')
export class TapGooseGameController {
  constructor(private readonly gameService: TapGooseGameService) { }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('matches/available')
  async getAvailableMatches(
    @Request() req: JwtRequest,
  ): Promise<GooseGameMatchDto[]> {
    return this.gameService.getAvailableMatches(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('match/active/:matchId')
  async getPlayerActiveMatch(
    @Request() req: JwtRequest,
    @Param('matchId') matchId: string,
  ): Promise<GooseGameMatchDto | ActiveMatchIsEnded> {
    return this.gameService.getPlayerActiveMatch(req.user.id, matchId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('matches/history/user/:userId')
  async getUserMatchesHistory(
    @Param('userId') userId: string,
  ): Promise<HistoryOfGooseGameMatch[]> {
    return this.gameService.getUserMatchesHistory(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('matches/history/match/:matchId')
  async getUserMatchHistory(
    @Param('matchId') matchId: string,
  ): Promise<HistoryOfGooseGameMatch | null> {
    return this.gameService.getUserMatchHistory(matchId);
  }
}
