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

  crear(titulo: string): void {
    this.tareasService.crear(titulo).subscribe((tarea) => {
      this.tareas.update((tareas) => [...tareas, tarea]);
    });
  }

  actualizar(id: number): void {
    const titulo = prompt('Nuevo título');

    if (!titulo) {
      return;
    }

    this.tareasService.actualizar(id, titulo).subscribe((tareaActualizada) => {
      this.tareas.update((tareas) =>
        tareas.map((tarea) =>
          tarea.id === id ? tareaActualizada : tarea,
        ),
      );
    });
  }

  eliminar(id: number): void {
    this.tareasService.eliminar(id).subscribe(() => {
      this.tareas.update((tareas) =>
        tareas.filter((tarea) => tarea.id !== id),
      );
    });
  }
}
