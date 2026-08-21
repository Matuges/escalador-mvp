import { Test, TestingModule } from '@nestjs/testing';
import { QualificacaoController } from './qualificacao.controller';
import { QualificacaoService } from './qualificacao.service';

describe('QualificacaoController', () => {
  let controller: QualificacaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QualificacaoController],
      providers: [QualificacaoService],
    }).compile();

    controller = module.get<QualificacaoController>(QualificacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
