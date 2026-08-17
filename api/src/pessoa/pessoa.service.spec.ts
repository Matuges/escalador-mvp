import { Test, TestingModule } from '@nestjs/testing';
import { PessoaService } from './pessoa.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PessoaService', () => {
  let service: PessoaService;
  let prisma: { pessoa: { create: jest.Mock, findMany: jest.Mock, findUnique: jest.Mock, update: jest.Mock, delete: jest.Mock }, culto: { findMany: jest.Mock } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PessoaService,
        {
          provide: PrismaService,
          useValue: {
            pessoa: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn()
            },
            culto: {
              findMany: jest.fn()
            }
          }
        }
      ],
    }).compile();

    service = module.get<PessoaService>(PessoaService);
    prisma = module.get<PrismaService>(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new pessoa', async () => {
    const dto = { nome: 'Maria' };
    const pessoaCriada = { id: 1, nome: 'Maria' };
    prisma.pessoa.create.mockResolvedValue(pessoaCriada);

    const resultado = await service.create(dto);

    expect(prisma.pessoa.create).toHaveBeenCalledWith({ data: { nome: dto.nome } });
    expect(resultado).toEqual(pessoaCriada);
  })

  it('should find all pessoas', async () => {
    const pessoas = [{ id: 1, nome: 'Maria' }, { id: 2, nome: 'João' }]

    prisma.pessoa.findMany.mockResolvedValue(pessoas)

    const resultado = await service.findAll()

    expect(prisma.pessoa.findMany).toHaveBeenCalled()
    expect(resultado).toEqual(pessoas)
  })

  it('should find one pessoa', async () => {
    const pessoa = { id: 1, nome: 'Maria' }
    const id = 1

    prisma.pessoa.findUnique.mockResolvedValue(pessoa)

    const resultado = await service.findUnique(id)

    expect(prisma.pessoa.findUnique).toHaveBeenCalledWith({ where: { id } })
    expect(resultado).toEqual(pessoa)
  })

  it('shoud update one pessoa', async () => {
    const dto = { nome: 'João' }
    const id = 1

    const pessoaEditada = { id: 1, nome: 'João' }
    prisma.pessoa.update.mockResolvedValue(pessoaEditada)

    const resultado = await service.update(id, dto)

    expect(prisma.pessoa.update).toHaveBeenCalledWith({ data: { nome: dto.nome }, where: { id } })
    expect(resultado).toEqual(pessoaEditada)
  })

  it('should remove one pessoa', async () => {
    const id = 1
    const pessoa = { id: 1, nome: "Mateus" }
    prisma.pessoa.delete.mockResolvedValue(pessoa)

    const resultado = await service.delete(id)

    expect(prisma.pessoa.delete).toHaveBeenCalledWith({ where: { id } })
    expect(resultado).toEqual(pessoa)
  })

  it('should find disponibilidades', async () => {
    const id = 1

    const cultos = [{ id: 1, nome: "Manha", data: "21/08/2026", indisponibilidades: [{ pessoaId: 1, cultoId: 1 }] }, { id: 2, nome: "Noite", data: "21/08/2026", indisponibilidades: [{ pessoaId: 2, cultoId: 2 }] }]

    prisma.culto.findMany.mockResolvedValue(cultos)

    const resultado = await service.findDisponibilidade(id)

    expect(prisma.culto.findMany).toHaveBeenCalledWith({
      include: {
        indisponibilidades: {
          where: { pessoaId: id }
        }
      }
    })

    expect(resultado).toEqual(cultos.map((culto) => ({
      culto: culto.nome,
      id: culto.id,
      data: culto.data,
      disponivel: culto.indisponibilidades.length === 0
    })))
  })
})
