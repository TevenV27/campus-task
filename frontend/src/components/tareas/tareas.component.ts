import { Component, OnInit, inject, signal } from '@angular/core';
import { Tarea } from './tarea.model';
import { TareasService } from './tareas.service';

@Component({
  selector: 'app-tareas',
  standalone: true,
  templateUrl: './tareas.component.html',
  styleUrl: './tareas.component.css',
})
export class TareasComponent implements OnInit {
  private readonly tareasService = inject(TareasService);
  tareas = signal<Tarea[]>([]);

  editandoId = signal<number | null>(null);
  error = signal('');

  ngOnInit(): void {
    this.tareasService.listar().subscribe((tareas) => {
      this.tareas.set(tareas);
    });
  }
  crear(titulo: string) {
    this.tareasService.crear(titulo).subscribe((tarea) => {
      this.tareas.update((tareas) => [...tareas, tarea]);
    });
  }

    editar(id: number) {
    this.error.set('');
    this.editandoId.set(id);
  }

  guardar(id: number, titulo: string) {
    this.tareasService.actualizar(id, titulo).subscribe({
      next: (actualizada) => {
        this.tareas.update((tareas) =>
          tareas.map((tarea) => (tarea.id === actualizada.id ? actualizada : tarea)),
        );
        this.editandoId.set(null);
      },
      error: () => {
        this.error.set('No se pudo guardar: la tarea ya no existe.');
      },
    });
  }

    eliminar(id: number) {
    this.error.set('');
    this.tareasService.eliminar(id).subscribe({
      next: (eliminada) => {
        this.tareas.update((tareas) =>
          tareas.filter((tarea) => tarea.id !== eliminada.id),
        );
      },
      error: () => {
        this.error.set('No se pudo eliminar: la tarea ya no existe.');
      },
    });
  }
}
