import { Test, TestingModule } from '@nestjs/testing';
import { QualificacaoService } from './qualificacao.service';
import { PrismaService } from '../prisma/prisma.service';

describe('QualificacaoService', () => {
  let service: QualificacaoService;
  let prisma: { qualificacao: { upsert: jest.Mock; deleteMany: jest.Mock } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QualificacaoService,
        {
          provide: PrismaService,
          useValue: {
            qualificacao: {
              upsert: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<QualificacaoService>(QualificacaoService);
    prisma = module.get<PrismaService>(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set a qualificacao', async () => {
    const pessoaId = 1;
    const funcaoId = 2;
    const qualificacaoCriada = { pessoaId, funcaoId };

    prisma.qualificacao.upsert.mockResolvedValue(qualificacaoCriada);

    const resultado = await service.setQualificacao(pessoaId, funcaoId);

    expect(prisma.qualificacao.upsert).toHaveBeenCalledWith({
      create: { pessoaId, funcaoId },
      update: {},
      where: { pessoaId_funcaoId: { pessoaId, funcaoId } },
    });
    expect(resultado).toEqual(qualificacaoCriada);
  });

  it('should remove a qualificacao', async () => {
    const pessoaId = 1;
    const funcaoId = 2;
    const removida = { count: 1 };

    prisma.qualificacao.deleteMany.mockResolvedValue(removida);

    const resultado = await service.removeQualificacao(pessoaId, funcaoId);

    expect(prisma.qualificacao.deleteMany).toHaveBeenCalledWith({
      where: { pessoaId, funcaoId },
    });
    expect(resultado).toEqual(removida);
  });

  it('should not throw when removing a qualificacao that does not exist', async () => {
    const pessoaId = 1;
    const funcaoId = 2;

    prisma.qualificacao.deleteMany.mockResolvedValue({ count: 0 });

    const resultado = await service.removeQualificacao(pessoaId, funcaoId);

    expect(resultado).toEqual({ count: 0 });
  });
});
