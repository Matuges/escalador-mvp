import { Test, TestingModule } from '@nestjs/testing';
import { MinisterioService } from './ministerio.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MinisterioService', () => {
  let service: MinisterioService;
  let prisma: {
    ministerio: {
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
        MinisterioService,
        {
          provide: PrismaService,
          useValue: {
            ministerio: {
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

    service = module.get<MinisterioService>(MinisterioService);
    prisma = module.get<PrismaService>(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a ministerio', async () => {
    const dto = { nome: 'Louvor' };
    const criado = { id: 1, nome: 'Louvor' };

    prisma.ministerio.create.mockResolvedValue(criado);

    const resultado = await service.create(dto);

    expect(prisma.ministerio.create).toHaveBeenCalledWith({
      data: { nome: dto.nome },
    });
    expect(resultado).toEqual(criado);
  });

  it('should list all ministerios', async () => {
    const ministerios = [
      { id: 1, nome: 'Louvor' },
      { id: 2, nome: 'Diaconato' },
    ];

    prisma.ministerio.findMany.mockResolvedValue(ministerios);

    const resultado = await service.findAll();

    expect(prisma.ministerio.findMany).toHaveBeenCalled();
    expect(resultado).toEqual(ministerios);
  });

  it('should find a ministerio by id', async () => {
    const id = 1;
    const ministerio = { id, nome: 'Louvor' };

    prisma.ministerio.findUnique.mockResolvedValue(ministerio);

    const resultado = await service.findUnique(id);

    expect(prisma.ministerio.findUnique).toHaveBeenCalledWith({
      where: { id },
    });
    expect(resultado).toEqual(ministerio);
  });

  it('should return null when ministerio is not found', async () => {
    const id = 999;

    prisma.ministerio.findUnique.mockResolvedValue(null);

    const resultado = await service.findUnique(id);

    expect(resultado).toBeNull();
  });

  it('should update a ministerio', async () => {
    const id = 1;
    const dto = { nome: 'Louvor Atualizado' };
    const atualizado = { id, nome: 'Louvor Atualizado' };

    prisma.ministerio.update.mockResolvedValue(atualizado);

    const resultado = await service.update(id, dto);

    expect(prisma.ministerio.update).toHaveBeenCalledWith({
      data: { nome: dto.nome },
      where: { id },
    });
    expect(resultado).toEqual(atualizado);
  });

  it('should delete a ministerio', async () => {
    const id = 1;
    const removido = { id, nome: 'Louvor' };

    prisma.ministerio.delete.mockResolvedValue(removido);

    const resultado = await service.delete(id);

    expect(prisma.ministerio.delete).toHaveBeenCalledWith({
      where: { id },
    });
    expect(resultado).toEqual(removido);
  });
});
