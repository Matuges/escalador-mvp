import { Test, TestingModule } from '@nestjs/testing';
import { ConfiguracaoFormularioController } from './configuracao-formulario.controller';
import { ConfiguracaoFormularioService } from './configuracao-formulario.service';

describe('ConfiguracaoFormularioController', () => {
  let controller: ConfiguracaoFormularioController;
  let service: { find: jest.Mock; update: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfiguracaoFormularioController],
      providers: [
        {
          provide: ConfiguracaoFormularioService,
          useValue: {
            find: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ConfiguracaoFormularioController>(ConfiguracaoFormularioController);
    service = module.get<ConfiguracaoFormularioService>(ConfiguracaoFormularioService) as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find', () => {
    it('should return the result from the service', async () => {
      const config = { id: 1, diaCorte: 20 };
      service.find.mockResolvedValue(config);

      const resultado = await controller.find();

      expect(service.find).toHaveBeenCalled();
      expect(resultado).toEqual(config);
    });
  });

  describe('update', () => {
    it('should pass the dto to the service and return the result', async () => {
      const dto = { diaCorte: 25 };
      const config = { id: 1, diaCorte: 25 };
      service.update.mockResolvedValue(config);

      const resultado = await controller.update(dto);

      expect(service.update).toHaveBeenCalledWith(dto);
      expect(resultado).toEqual(config);
    });
  });
});
