import { Test, TestingModule } from '@nestjs/testing';
import { TapGooseGameService } from './tap-goose-game.service';

describe('TapGooseGameService', () => {
  let service: TapGooseGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TapGooseGameService],
    }).compile();

    service = module.get<TapGooseGameService>(TapGooseGameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
