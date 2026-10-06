import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tarea } from './tarea.model';
import { TareasService } from './tareas.service';

@Component({
  selector: 'app-tareas',
  standalone: true,
  templateUrl: './tareas.component.html',
  styleUrl: './tareas.component.css',
  imports: [FormsModule],
})
export class TareasComponent implements OnInit {
  private readonly tareasService = inject(TareasService);
  tareas = signal<Tarea[]>([]);
  tareaEditandoId: number | null = null;
  tituloEditado = '';
  mensajeError = '';

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
    this.mensajeError = '';
    this.tareaEditandoId = tarea.id;
    this.tituloEditado = tarea.titulo;
  }

  guardarEdicion() {
    if (this.tareaEditandoId === null) {
      return;
    }

    this.tareasService
      .actualizar(this.tareaEditandoId, this.tituloEditado)
      .subscribe({
        next: (tareaActualizada) => {this.tareas.update((tareas) =>
          tareas.map((tarea) =>
            tarea.id === tareaActualizada.id ? tareaActualizada : tarea,
          ),
        );

        this.tareaEditandoId = null;
        this.tituloEditado = '';
        this.mensajeError = '';
        },
        error: (e: HttpErrorResponse) => this.manejarError(e),
      });
  }

  private manejarError(e: HttpErrorResponse) {
    if (e.status === 404) {
      this.mensajeError = 'La tarea ya no existe.';
      this.tareaEditandoId = null;
      this.tituloEditado = '';
      this.tareasService.listar().subscribe((tareas) => {
      this.tareas.set(tareas);});
    } else {
      this.mensajeError = 'No se pudo completar la operación. Intenta de nuevo.';
    }
  }

  eliminar(id: number) {
    this.tareasService.eliminar(id).subscribe({
      next: () => {
        this.tareas.update((tareas) =>
          tareas.filter((tarea) => tarea.id !== id),
        );
        this.mensajeError = '';
      },
      error: (e: HttpErrorResponse) => this.manejarError(e),
    });
  }

}
