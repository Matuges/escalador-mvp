import { Test, TestingModule } from '@nestjs/testing';
import { CultoController } from './culto.controller';
import { CultoService } from './culto.service';

describe.skip('CultoController', () => {
  let controller: CultoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CultoController],
      providers: [CultoService],
    }).compile();

    controller = module.get<CultoController>(CultoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
