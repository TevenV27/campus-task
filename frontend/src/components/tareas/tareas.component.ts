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
  editar(tarea: Tarea) {
    const nuevoTitulo = window.prompt('Nuevo título:', tarea.titulo);

    if (!nuevoTitulo || nuevoTitulo.trim() === '') {
      return;
    }

    this.tareasService.actualizar(tarea.id, nuevoTitulo.trim()).subscribe((tareaActualizada) => {
      this.tareas.update((tareas) =>
        tareas.map((t) =>
          t.id === tareaActualizada.id ? tareaActualizada : t
        )
      );
    });
  }
  eliminar(tarea: Tarea) {
    this.tareasService.eliminar(tarea.id).subscribe((tareaEliminada) => {
      this.tareas.update((tareas) =>
        tareas.filter((t) => t.id !== tareaEliminada.id)
      );
    });
  }
}
