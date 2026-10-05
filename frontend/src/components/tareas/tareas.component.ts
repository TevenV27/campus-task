import { HttpErrorResponse } from '@angular/common/http';
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
  // id de la tarea que se está editando (null = ninguna)
  editandoId = signal<number | null>(null);
  // mensaje de error para el usuario ('' = sin error)
  error = signal<string>('');

  ngOnInit(): void {
    this.cargar();
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

  cancelar() {
    this.editandoId.set(null);
  }

  guardar(id: number, titulo: string) {
    const nuevoTitulo = titulo.trim();
    if (!nuevoTitulo) {
      this.error.set('El título no puede estar vacío.');
      return;
    }
    this.error.set('');
    // La lista cambia solo dentro de la respuesta exitosa del backend.
    this.tareasService.actualizar(id, nuevoTitulo).subscribe({
      next: (actualizada) => {
        this.tareas.update((tareas) =>
          tareas.map((t) => (t.id === actualizada.id ? actualizada : t)),
        );
        this.editandoId.set(null);
      },
      error: (e: HttpErrorResponse) => this.manejarError(e, 'actualizar'),
    });
  }

  eliminar(id: number) {
    this.error.set('');
    // La tarea sale de la lista solo cuando el backend responde con éxito.
    this.tareasService.eliminar(id).subscribe({
      next: (eliminada) => {
        this.tareas.update((tareas) =>
          tareas.filter((t) => t.id !== eliminada.id),
        );
      },
      error: (e: HttpErrorResponse) => this.manejarError(e, 'eliminar'),
    });
  }

  private cargar() {
    this.tareasService.listar().subscribe((tareas) => {
      this.tareas.set(tareas);
    });
  }

  private manejarError(e: HttpErrorResponse, accion: string) {
    if (e.status === 404) {
      // La tarea ya no existe en el servidor: avisar y resincronizar la lista.
      this.error.set('Esa tarea ya no existe. Se actualizó la lista.');
      this.editandoId.set(null);
      this.cargar();
    } else {
      this.error.set(`No se pudo ${accion} la tarea. Intenta de nuevo.`);
    }
  }
}