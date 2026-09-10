import { Test, TestingModule } from '@nestjs/testing';
import { IndisponibilidadeService } from './indisponibilidade.service';
import { PrismaService } from '../prisma/prisma.service';

describe('IndisponibilidadeService', () => {
  let service: IndisponibilidadeService;
  let prisma: {
    indisponibilidade: { upsert: jest.Mock; deleteMany: jest.Mock };
    pessoa: { findMany: jest.Mock };
    culto: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndisponibilidadeService,
        {
          provide: PrismaService,
          useValue: {
            indisponibilidade: {
              upsert: jest.fn(),
              deleteMany: jest.fn(),
            },
            pessoa: { findMany: jest.fn() },
            culto: { findMany: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<IndisponibilidadeService>(IndisponibilidadeService);
    prisma = module.get<PrismaService>(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set indisponibilidade', async () => {
    const pessoaId = 1;
    const cultoId = 2;
    const indisponibilidade = { pessoaId, cultoId };

    prisma.indisponibilidade.upsert.mockResolvedValue(indisponibilidade);

    const resultado = await service.setIndisponibilidade(pessoaId, cultoId);

    expect(prisma.indisponibilidade.upsert).toHaveBeenCalledWith({
      create: { pessoaId, cultoId },
      update: {},
      where: { pessoaId_cultoId: { pessoaId, cultoId } },
    });
    expect(resultado).toEqual(indisponibilidade);
  });

  it('should remove a indisponibilidade', async () => {
    const pessoaId = 1;
    const cultoId = 2;
    prisma.indisponibilidade.deleteMany.mockResolvedValue({ count: 1 });

    const resultado = await service.removeIndisponibilidade(pessoaId, cultoId);

    expect(prisma.indisponibilidade.deleteMany).toHaveBeenCalledWith({
      where: { pessoaId, cultoId },
    });
    expect(resultado).toEqual({ count: 1 });
  });

  it('should be idempotent when removing a non-existent indisponibilidade', async () => {
    prisma.indisponibilidade.deleteMany.mockResolvedValue({ count: 0 });

    const resultado = await service.removeIndisponibilidade(1, 99);

    expect(resultado).toEqual({ count: 0 });
  });

  describe('findPorCulto', () => {
    const cultoId = 1;
    const pessoas = [
      { id: 1, nome: 'Maria', indisponibilidades: [] },
      { id: 2, nome: 'João', indisponibilidades: [{ pessoaId: 2, cultoId: 1 }] },
    ];

    it('should return all persons with availability flag', async () => {
      prisma.pessoa.findMany.mockResolvedValue(pessoas);

      const resultado = await service.findPorCulto(cultoId);

      expect(prisma.pessoa.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { indisponibilidades: { where: { cultoId } } },
      });
      expect(resultado).toEqual([
        { id: 1, pessoa: 'Maria', disponivel: true },
        { id: 2, pessoa: 'João', disponivel: false },
      ]);
    });

    it('should filter by funcaoId', async () => {
      const funcaoId = 2;
      prisma.pessoa.findMany.mockResolvedValue([pessoas[0]]);

      await service.findPorCulto(cultoId, funcaoId);

      expect(prisma.pessoa.findMany).toHaveBeenCalledWith({
        where: { qualificacoes: { some: { funcaoId } } },
        include: { indisponibilidades: { where: { cultoId } } },
      });
    });

    it('should filter by ministerioId', async () => {
      const ministerioId = 3;
      prisma.pessoa.findMany.mockResolvedValue([pessoas[0]]);

      await service.findPorCulto(cultoId, undefined, ministerioId);

      expect(prisma.pessoa.findMany).toHaveBeenCalledWith({
        where: { qualificacoes: { some: { funcao: { ministerioId } } } },
        include: { indisponibilidades: { where: { cultoId } } },
      });
    });

    it('should prefer funcaoId over ministerioId when both are given', async () => {
      const funcaoId = 2;
      const ministerioId = 3;
      prisma.pessoa.findMany.mockResolvedValue([pessoas[0]]);

      await service.findPorCulto(cultoId, funcaoId, ministerioId);

      expect(prisma.pessoa.findMany).toHaveBeenCalledWith({
        where: { qualificacoes: { some: { funcaoId } } },
        include: { indisponibilidades: { where: { cultoId } } },
      });
    });
  });

  describe('findPorPessoa', () => {
    it('should return all cultos with availability flag for the person', async () => {
      const pessoaId = 1;
      const cultos = [
        {
          id: 1,
          nome: 'Culto de domingo a manhã',
          data: new Date(2026, 7, 2),
          indisponibilidades: [{ pessoaId: 1, cultoId: 1 }],
        },
        {
          id: 2,
          nome: 'Culto de domingo de noite',
          data: new Date(2026, 7, 2),
          indisponibilidades: [],
        },
      ];
      prisma.culto.findMany.mockResolvedValue(cultos);

      const resultado = await service.findPorPessoa(pessoaId);

      expect(prisma.culto.findMany).toHaveBeenCalledWith({
        include: { indisponibilidades: { where: { pessoaId } } },
      });
      expect(resultado).toEqual([
        { id: 1, culto: 'Culto de domingo a manhã', data: cultos[0].data, disponivel: false },
        { id: 2, culto: 'Culto de domingo de noite', data: cultos[1].data, disponivel: true },
      ]);
    });
  });
});
