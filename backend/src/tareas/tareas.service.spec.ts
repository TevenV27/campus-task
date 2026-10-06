import { TareasService } from './tareas.service';
import { DatabaseService } from '../database/database.service';

describe('TareasService', () => {
  let service: TareasService;
  const query = jest.fn();

  beforeEach(() => {
    query.mockReset();

    const db = {
      query,
    } as unknown as DatabaseService;

    service = new TareasService(db);
  });

  it('lista las tareas', async () => {
    query.mockResolvedValue({
      rows: [
        { id: 1, titulo: 'Tarea 1' },
        { id: 2, titulo: 'Tarea 2' },
      ],
    });

    await expect(service.listar()).resolves.toEqual([
      { id: 1, titulo: 'Tarea 1' },
      { id: 2, titulo: 'Tarea 2' },
    ]);

    expect(query).toHaveBeenCalledWith(
      'SELECT id, titulo FROM tareas ORDER BY id',
    );
  });

  it('crea una tarea', async () => {
    query.mockResolvedValue({
      rows: [{ id: 3, titulo: 'Nueva tarea' }],
    });

    await expect(
      service.crear('Nueva tarea'),
    ).resolves.toEqual({
      id: 3,
      titulo: 'Nueva tarea',
    });

    expect(query).toHaveBeenCalledWith(
      'INSERT INTO tareas (titulo) VALUES ($1) RETURNING id, titulo',
      ['Nueva tarea'],
    );
  });

  it('actualiza una tarea', async () => {
    query.mockResolvedValue({
      rows: [{ id: 1, titulo: 'Tarea actualizada' }],
    });

    await expect(
      service.actualizar(1, 'Tarea actualizada'),
    ).resolves.toEqual({
      id: 1,
      titulo: 'Tarea actualizada',
    });

    expect(query).toHaveBeenCalledWith(
      'UPDATE tareas SET titulo = $1 WHERE id = $2 RETURNING id, titulo',
      ['Tarea actualizada', 1],
    );
  });

  it('elimina una tarea', async () => {
    query.mockResolvedValue({
      rows: [{ id: 1, titulo: 'Tarea eliminada' }],
    });

    await expect(
      service.eliminar(1),
    ).resolves.toEqual({
      id: 1,
      titulo: 'Tarea eliminada',
    });

    expect(query).toHaveBeenCalledWith(
      'DELETE FROM tareas WHERE id = $1 RETURNING id, titulo',
      [1],
    );
  });
});