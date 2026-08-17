import { Test, TestingModule } from '@nestjs/testing';
import { IndisponibilidadeController } from './indisponibilidade.controller';
import { IndisponibilidadeService } from './indisponibilidade.service';

describe.skip('IndisponibilidadeController', () => {
  let controller: IndisponibilidadeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndisponibilidadeController],
      providers: [IndisponibilidadeService],
    }).compile();

    controller = module.get<IndisponibilidadeController>(IndisponibilidadeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
