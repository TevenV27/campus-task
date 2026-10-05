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
  mensajeError = signal('');

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
    this.mensajeError.set('');
    this.editandoId.set(id);
  }

  guardar(id: number, titulo: string) {
    this.tareasService.actualizar(id, titulo).subscribe({
      next: (actualizada) => {
        this.tareas.update((tareas) =>
          tareas.map((t) => (t.id === id ? actualizada : t)),
        );
        this.editandoId.set(null);
      },
      error: () => this.manejarError(),
    });
  }

  eliminar(id: number) {
    this.tareasService.eliminar(id).subscribe({
      next: () => {
        this.tareas.update((tareas) => tareas.filter((t) => t.id !== id));
      },
      error: () => this.manejarError(),
    });
  }

  private manejarError() {
    this.editandoId.set(null);
    this.mensajeError.set(
      'No se pudo completar la operación (la tarea pudo haber sido eliminada). Se recargó la lista.',
    );
    this.tareasService.listar().subscribe((tareas) => this.tareas.set(tareas));
  }
}
