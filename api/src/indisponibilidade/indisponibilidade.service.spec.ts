import { Test, TestingModule } from '@nestjs/testing';
import { IndisponibilidadeService } from './indisponibilidade.service';
import { PrismaService } from '../prisma/prisma.service';

describe('IndisponibilidadeService', () => {
  let service: IndisponibilidadeService;
  let prisma: { indisponibilidade: { upsert: jest.Mock, deleteMany: jest.Mock } };
  

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndisponibilidadeService,
               {
                        provide: PrismaService,
                        useValue: {
                          indisponibilidade: {
                            upsert: jest.fn(),
                            deleteMany: jest.fn(),
                          }
                        }
                      }
            ],
    }).compile();

    service = module.get<IndisponibilidadeService>(IndisponibilidadeService);
     prisma = module.get<PrismaService>(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set indisponibilidade', async () => {
    const pessoaId = 1
    const cultoId = 2
    const indisponibilidade = {pessoaId, cultoId}

    prisma.indisponibilidade.upsert.mockResolvedValue(indisponibilidade)

    const resultado = await service.setIndisponibilidade(pessoaId, cultoId)

    expect(prisma.indisponibilidade.upsert).toHaveBeenCalledWith({
      create: {pessoaId, cultoId},
      update: {},
      where: {pessoaId_cultoId: {pessoaId, cultoId}}
    })
    expect(resultado).toEqual(indisponibilidade)
  })

  it('should remove a indisponibilidade', async () => {
    const pessoaId = 1
    const cultoId = 2
    prisma.indisponibilidade.deleteMany.mockResolvedValue({ count: 1 })

    const resultado = await service.removeIndisponibilidade(pessoaId, cultoId)

    expect(prisma.indisponibilidade.deleteMany).toHaveBeenCalledWith({where: {pessoaId, cultoId}})
    expect(resultado).toEqual({ count: 1 })
  })

});
