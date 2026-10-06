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

  tareaEditando = signal<number | null>(null);
  tituloEditado = signal('');

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
    this.tareaEditando.set(tarea.id);
    this.tituloEditado.set(tarea.titulo);
  }

  cambiarTitulo(titulo: string) {
    this.tituloEditado.set(titulo);
  }

  guardar(tarea: Tarea) {
    this.tareasService
      .actualizar(tarea.id, this.tituloEditado())
      .subscribe((tareaActualizada) => {
        this.tareas.update((tareas) =>
          tareas.map((t) =>
            t.id === tareaActualizada.id ? tareaActualizada : t
          )
        );

        this.tareaEditando.set(null);
        this.tituloEditado.set('');
      });
  }

  eliminar(tarea: Tarea) {
    this.tareasService.eliminar(tarea.id).subscribe(() => {
      this.tareas.update((tareas) =>
        tareas.filter((t) => t.id !== tarea.id)
      );
    });
  }
}