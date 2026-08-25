import { Test, TestingModule } from '@nestjs/testing';
import { MinisterioController } from './ministerio.controller';
import { MinisterioService } from './ministerio.service';

describe('MinisterioController', () => {
  let controller: MinisterioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinisterioController],
      providers: [MinisterioService],
    }).compile();

    controller = module.get<MinisterioController>(MinisterioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
