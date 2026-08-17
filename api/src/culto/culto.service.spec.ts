import { Test, TestingModule } from '@nestjs/testing';
import { CultoService } from './culto.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CultoService', () => {
  let service: CultoService;
  let prisma: { culto: { create: jest.Mock, findMany: jest.Mock, findUnique: jest.Mock, update: jest.Mock, delete: jest.Mock } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CultoService,
        {
          provide: PrismaService,
          useValue: {
            culto: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn()
            }
          }
        }
      ],
    }).compile();

    service = module.get<CultoService>(CultoService);
    prisma = module.get<PrismaService>(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new culto', async () => {
    const dto = { nome: 'Culto da Manhã', data: new Date('2026-08-21') };
    const cultoCriado = { id: 1, nome: 'Culto da Manhã', data: new Date('2026-08-21') };
    prisma.culto.create.mockResolvedValue(cultoCriado);

    const resultado = await service.create(dto);

    expect(prisma.culto.create).toHaveBeenCalledWith({ data: { nome: dto.nome, data: dto.data } });
    expect(resultado).toEqual(cultoCriado);
  });

  it('should find all cultos', async () => {
    const cultos = [
      { id: 1, nome: 'Culto da Manhã', data: new Date('2026-08-21') },
      { id: 2, nome: 'Culto da Noite', data: new Date('2026-08-21') }
    ];
    prisma.culto.findMany.mockResolvedValue(cultos);

    const resultado = await service.findAll();

    expect(prisma.culto.findMany).toHaveBeenCalled();
    expect(resultado).toEqual(cultos);
  });

  it('should find one culto', async () => {
    const id = 1;
    const culto = { id: 1, nome: 'Culto da Manhã', data: new Date('2026-08-21') };
    prisma.culto.findUnique.mockResolvedValue(culto);

    const resultado = await service.findUnique(id);

    expect(prisma.culto.findUnique).toHaveBeenCalledWith({ where: { id } });
    expect(resultado).toEqual(culto);
  });

  it('should update one culto', async () => {
    const id = 1;
    const dto = { nome: 'Culto da Tarde', data: new Date('2026-08-22') };
    const cultoEditado = { id: 1, nome: 'Culto da Tarde', data: new Date('2026-08-22') };
    prisma.culto.update.mockResolvedValue(cultoEditado);

    const resultado = await service.update(id, dto);

    expect(prisma.culto.update).toHaveBeenCalledWith({ data: { nome: dto.nome, data: dto.data }, where: { id } });
    expect(resultado).toEqual(cultoEditado);
  });

  it('should delete one culto', async () => {
    const id = 1;
    const culto = { id: 1, nome: 'Culto da Manhã', data: new Date('2026-08-21') };
    prisma.culto.delete.mockResolvedValue(culto);

    const resultado = await service.delete(id);

    expect(prisma.culto.delete).toHaveBeenCalledWith({ where: { id } });
    expect(resultado).toEqual(culto);
  });
});
