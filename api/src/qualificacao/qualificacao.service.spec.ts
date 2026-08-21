import { Test, TestingModule } from '@nestjs/testing';
import { QualificacaoService } from './qualificacao.service';

describe('QualificacaoService', () => {
  let service: QualificacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QualificacaoService],
    }).compile();

    service = module.get<QualificacaoService>(QualificacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
