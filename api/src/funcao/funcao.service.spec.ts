import { Test, TestingModule } from '@nestjs/testing';
import { FuncaoService } from './funcao.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FuncaoService', () => {
  let service: FuncaoService;
  let prisma: {
    funcao: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FuncaoService,
        {
          provide: PrismaService,
          useValue: {
            funcao: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FuncaoService>(FuncaoService);
    prisma = module.get<PrismaService>(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a funcao for a ministerio', async () => {
    const ministerioId = 1;
    const dto = { nome: 'Vocalista' };
    const criada = { id: 1, nome: 'Vocalista', ministerioId };

    prisma.funcao.create.mockResolvedValue(criada);

    const resultado = await service.create(ministerioId, dto);

    expect(prisma.funcao.create).toHaveBeenCalledWith({
      data: { nome: dto.nome, ministerioId },
    });
    expect(resultado).toEqual(criada);
  });

  it('should list all funcoes of a ministerio', async () => {
    const ministerioId = 1;
    const funcoes = [
      { id: 1, nome: 'Vocalista', ministerioId },
      { id: 2, nome: 'Instrumentista', ministerioId },
    ];

    prisma.funcao.findMany.mockResolvedValue(funcoes);

    const resultado = await service.findAllByMinisterio(ministerioId);

    expect(prisma.funcao.findMany).toHaveBeenCalledWith({
      where: { ministerioId },
    });
    expect(resultado).toEqual(funcoes);
  });

  it('should find a funcao by id', async () => {
    const id = 1;
    const funcao = { id, nome: 'Vocalista', ministerioId: 1 };

    prisma.funcao.findUnique.mockResolvedValue(funcao);

    const resultado = await service.findUnique(id);

    expect(prisma.funcao.findUnique).toHaveBeenCalledWith({
      where: { id },
    });
    expect(resultado).toEqual(funcao);
  });

  it('should return null when funcao is not found', async () => {
    const id = 999;

    prisma.funcao.findUnique.mockResolvedValue(null);

    const resultado = await service.findUnique(id);

    expect(resultado).toBeNull();
  });

  it('should update a funcao', async () => {
    const id = 1;
    const dto = { nome: 'Vocalista Principal' };
    const atualizada = { id, nome: 'Vocalista Principal', ministerioId: 1 };

    prisma.funcao.update.mockResolvedValue(atualizada);

    const resultado = await service.update(id, dto);

    expect(prisma.funcao.update).toHaveBeenCalledWith({
      data: { nome: dto.nome },
      where: { id },
    });
    expect(resultado).toEqual(atualizada);
  });

  it('should delete a funcao', async () => {
    const id = 1;
    const removida = { id, nome: 'Vocalista', ministerioId: 1 };

    prisma.funcao.delete.mockResolvedValue(removida);

    const resultado = await service.delete(id);

    expect(prisma.funcao.delete).toHaveBeenCalledWith({
      where: { id },
    });
    expect(resultado).toEqual(removida);
  });
});
