import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service';
import { TareasService } from './tareas.service';

describe('TareasService', () => {
  let service: TareasService;
  const query = jest.fn();

  beforeEach(async () => {
    query.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        TareasService,
        { provide: DatabaseService, useValue: { query } },
      ],
    }).compile();

    service = module.get(TareasService);
  });

  it('devuelve las filas de la consulta al listar', async () => {
    const tareas = [{ id: 1, titulo: 'Leer la guía de la clase 2' }];
    query.mockResolvedValue({ rows: tareas });

    await expect(service.listar()).resolves.toEqual(tareas);
    expect(query).toHaveBeenCalledWith(
      'SELECT id, titulo FROM tareas ORDER BY id',
    );
  });

  it('inserta el título y devuelve la fila creada', async () => {
    const creada = { id: 2, titulo: 'Nueva tarea' };
    query.mockResolvedValue({ rows: [creada] });

    await expect(service.crear('Nueva tarea')).resolves.toEqual(creada);
    expect(query).toHaveBeenCalledWith(
      'INSERT INTO tareas (titulo) VALUES ($1) RETURNING id, titulo',
      ['Nueva tarea'],
    );
  });

  it('elimina por id y devuelve la fila eliminada', async () => {
    const eliminada = { id: 2, titulo: 'Preparar el entorno de desarrollo' };
    query.mockResolvedValue({ rows: [eliminada] });

    await expect(service.eliminar(2)).resolves.toEqual(eliminada);
    expect(query).toHaveBeenCalledWith(
      'DELETE FROM tareas WHERE id = $1 RETURNING id, titulo',
      [2],
    );
  });

  it('lanza NotFoundException al eliminar un id que no existe', async () => {
    query.mockResolvedValue({ rows: [] });

    await expect(service.eliminar(999)).rejects.toThrow(NotFoundException);
    expect(query).toHaveBeenCalledWith(
      'DELETE FROM tareas WHERE id = $1 RETURNING id, titulo',
      [999],
    );
  });
});
