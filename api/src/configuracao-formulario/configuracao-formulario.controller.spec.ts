import { Test, TestingModule } from '@nestjs/testing';
import { ConfiguracaoFormularioController } from './configuracao-formulario.controller';
import { ConfiguracaoFormularioService } from './configuracao-formulario.service';

describe.skip('ConfiguracaoFormularioController', () => {
  let controller: ConfiguracaoFormularioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfiguracaoFormularioController],
      providers: [ConfiguracaoFormularioService],
    }).compile();

    controller = module.get<ConfiguracaoFormularioController>(ConfiguracaoFormularioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
