import { Test, TestingModule } from '@nestjs/testing';
import { ConfiguracaoFormularioService } from './configuracao-formulario.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ConfiguracaoFormularioService', () => {
  let service: ConfiguracaoFormularioService;
  let prisma: {
    configuracaoFormulario: {
      findUnique: jest.Mock;
      upsert: jest.Mock;
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfiguracaoFormularioService,
        {
          provide: PrismaService,
          useValue: {
            configuracaoFormulario: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ConfiguracaoFormularioService>(ConfiguracaoFormularioService);
    prisma = module.get<PrismaService>(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('find', () => {
    it('should always query id = 1', async () => {
      const config = { id: 1, diaCorte: 20 };
      prisma.configuracaoFormulario.findUnique.mockResolvedValue(config);

      const resultado = await service.find();

      expect(prisma.configuracaoFormulario.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(resultado).toEqual(config);
    });
  });

  describe('update', () => {
    it('should upsert with id = 1 and the given diaCorte', async () => {
      const dto = { diaCorte: 25 };
      const config = { id: 1, diaCorte: 25 };
      prisma.configuracaoFormulario.upsert.mockResolvedValue(config);

      const resultado = await service.update(dto);

      expect(prisma.configuracaoFormulario.upsert).toHaveBeenCalledWith({
        where: { id: 1 },
        update: { diaCorte: 25 },
        create: { id: 1, diaCorte: 25 },
      });
      expect(resultado).toEqual(config);
    });

    it('should create the record if it does not exist yet', async () => {
      const dto = { diaCorte: 15 };
      prisma.configuracaoFormulario.upsert.mockResolvedValue({ id: 1, diaCorte: 15 });

      await service.update(dto);

      const call = prisma.configuracaoFormulario.upsert.mock.calls[0][0];
      expect(call.create).toEqual({ id: 1, diaCorte: 15 });
    });
  });
});
