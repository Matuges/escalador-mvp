import { Test, TestingModule } from '@nestjs/testing';
import { ConfiguracaoFormularioService } from './configuracao-formulario.service';

describe('ConfiguracaoFormularioService', () => {
  let service: ConfiguracaoFormularioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfiguracaoFormularioService],
    }).compile();

    service = module.get<ConfiguracaoFormularioService>(ConfiguracaoFormularioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
