import { Test, TestingModule } from '@nestjs/testing';
import { IndisponibilidadeService } from './indisponibilidade.service';

describe('IndisponibilidadeService', () => {
  let service: IndisponibilidadeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndisponibilidadeService],
    }).compile();

    service = module.get<IndisponibilidadeService>(IndisponibilidadeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
