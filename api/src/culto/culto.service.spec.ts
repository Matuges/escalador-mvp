import { Test, TestingModule } from '@nestjs/testing';
import { CultoService } from './culto.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CultoService', () => {
  let service: CultoService;
  let prisma: {
    culto: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      createMany: jest.Mock;
    };
    pessoa: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CultoService,
        {
          provide: PrismaService,
          useValue: {
            culto: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              createMany: jest.fn(),
            },
            pessoa: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CultoService>(CultoService);
    prisma = module.get<PrismaService>(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new culto', async () => {
    const dto = { nome: 'Culto da Manhã', data: '2026-08-21' };
    const cultoCriado = {
      id: 1,
      nome: 'Culto da Manhã',
      data: new Date('2026-08-21'),
    };
    prisma.culto.create.mockResolvedValue(cultoCriado);

    const resultado = await service.create(dto);

    expect(prisma.culto.create).toHaveBeenCalledWith({
      data: { nome: dto.nome, data: dto.data },
    });
    expect(resultado).toEqual(cultoCriado);
  });

  it('should find all cultos', async () => {
    const cultos = [
      { id: 1, nome: 'Culto da Manhã', data: new Date('2026-08-21') },
      { id: 2, nome: 'Culto da Noite', data: new Date('2026-08-21') },
    ];
    prisma.culto.findMany.mockResolvedValue(cultos);

    const resultado = await service.findAll();

    expect(prisma.culto.findMany).toHaveBeenCalled();
    expect(resultado).toEqual(cultos);
  });

  it('should find one culto', async () => {
    const id = 1;
    const culto = {
      id: 1,
      nome: 'Culto da Manhã',
      data: new Date('2026-08-21'),
    };
    prisma.culto.findUnique.mockResolvedValue(culto);

    const resultado = await service.findUnique(id);

    expect(prisma.culto.findUnique).toHaveBeenCalledWith({ where: { id } });
    expect(resultado).toEqual(culto);
  });

  it('should update one culto', async () => {
    const id = 1;
    const dto = { nome: 'Culto da Tarde', data: '2026-08-22' };
    const cultoEditado = {
      id: 1,
      nome: 'Culto da Tarde',
      data: new Date('2026-08-22'),
    };
    prisma.culto.update.mockResolvedValue(cultoEditado);

    const resultado = await service.update(id, dto);

    expect(prisma.culto.update).toHaveBeenCalledWith({
      data: { nome: dto.nome, data: dto.data },
      where: { id },
    });
    expect(resultado).toEqual(cultoEditado);
  });

  it('should delete one culto', async () => {
    const id = 1;
    const culto = {
      id: 1,
      nome: 'Culto da Manhã',
      data: new Date('2026-08-21'),
    };
    prisma.culto.delete.mockResolvedValue(culto);

    const resultado = await service.delete(id);

    expect(prisma.culto.delete).toHaveBeenCalledWith({ where: { id } });
    expect(resultado).toEqual(culto);
  });

  it('should generate the cultos for a given month', () => {
    const resultado = service.gerarCultosDoMes(2026, 8);

    expect(resultado).toHaveLength(16);
    expect(
      resultado.filter((c) => c.nome === 'Culto de domingo a manhã'),
    ).toHaveLength(5);
    expect(
      resultado.filter((c) => c.nome === 'Culto de domingo de noite'),
    ).toHaveLength(5);
    expect(resultado.filter((c) => c.nome === 'Culto de terça')).toHaveLength(
      4,
    );
    expect(
      resultado.filter((c) => c.nome === 'Culto de consagração'),
    ).toHaveLength(2);
    expect(resultado).toContainEqual({
      nome: 'Culto de consagração',
      data: new Date(2026, 7, 1),
    });
    expect(resultado).toContainEqual({
      nome: 'Culto de consagração',
      data: new Date(2026, 7, 15),
    });
    expect(resultado).not.toContainEqual(
      expect.objectContaining({
        nome: 'Culto de consagração',
        data: new Date(2026, 7, 8),
      }),
    );
  });

  it('should save the cultos generated for the month', () => {
    const cultosGerados = service.gerarCultosDoMes(2026, 8);
    prisma.culto.createMany.mockResolvedValue({ count: cultosGerados.length });

    const resultado = service.salvarCultosDoMes(2026, 8);

    expect(prisma.culto.createMany).toHaveBeenCalledWith({
      data: cultosGerados,
    });
    return expect(resultado).resolves.toEqual({ count: cultosGerados.length });
  });

  it('should find disponibilidades for a culto', async () => {
    const id = 1;
    const pessoas = [
      { id: 1, nome: 'Maria', indisponibilidades: [] },
      {
        id: 2,
        nome: 'João',
        indisponibilidades: [{ pessoaId: 2, cultoId: 1 }],
      },
    ];
    prisma.pessoa.findMany.mockResolvedValue(pessoas);

    const resultado = await service.findDisponibilidade(id);

    expect(prisma.pessoa.findMany).toHaveBeenCalledWith({
      include: {
        indisponibilidades: {
          where: { cultoId: id },
        },
      },
    });

    expect(resultado).toEqual(
      pessoas.map((pessoa) => ({
        pessoa: pessoa.nome,
        id: pessoa.id,
        disponivel: pessoa.indisponibilidades.length === 0,
      })),
    );
  });

  it('should find disponibilidades for a culto filtered by funcao', async () => {
    const id = 1;
    const funcaoId = 2;
    const pessoas = [{ id: 1, nome: 'Maria', indisponibilidades: [] }];
    prisma.pessoa.findMany.mockResolvedValue(pessoas);

    const resultado = await service.findDisponibilidade(id, funcaoId);

    expect(prisma.pessoa.findMany).toHaveBeenCalledWith({
      where: { qualificacoes: { some: { funcaoId } } },
      include: {
        indisponibilidades: {
          where: { cultoId: id },
        },
      },
    });

    expect(resultado).toEqual(
      pessoas.map((pessoa) => ({
        pessoa: pessoa.nome,
        id: pessoa.id,
        disponivel: pessoa.indisponibilidades.length === 0,
      })),
    );
  });
});
