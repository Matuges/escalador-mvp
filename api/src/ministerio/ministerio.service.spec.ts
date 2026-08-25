import { Test, TestingModule } from '@nestjs/testing';
import { MinisterioService } from './ministerio.service';

describe('MinisterioService', () => {
  let service: MinisterioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinisterioService],
    }).compile();

    service = module.get<MinisterioService>(MinisterioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
