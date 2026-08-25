import { Test, TestingModule } from '@nestjs/testing';
import { FuncaoController } from './funcao.controller';
import { FuncaoService } from './funcao.service';

describe.skip('FuncaoController', () => {
  let controller: FuncaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FuncaoController],
      providers: [FuncaoService],
    }).compile();

    controller = module.get<FuncaoController>(FuncaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
