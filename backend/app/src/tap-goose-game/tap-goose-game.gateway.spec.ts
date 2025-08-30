import { Test, TestingModule } from '@nestjs/testing';
import { TapGooseGameGateway } from './tap-goose-game.gateway';
import { TapGooseGameService } from './tap-goose-game.service';

describe('TapGooseGameGateway', () => {
  let gateway: TapGooseGameGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TapGooseGameGateway, TapGooseGameService],
    }).compile();

    gateway = module.get<TapGooseGameGateway>(TapGooseGameGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
