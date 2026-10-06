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

  actualizar(id: number, titulo: string) {
    this.tareasService.actualizar(id, titulo).subscribe((tareaActualizada) => {
      this.tareas.update((tareasActuales) => 
        tareasActuales.map(tareaExistente => 
          tareaExistente.id === id ? tareaActualizada : tareaExistente
        )
      );
    });
  }

  eliminar(id: number) {
    this.tareasService.eliminar(id).subscribe(() => {
      this.tareas.update((listaActual) => listaActual.filter(tarea => tarea.id !== id));
    });
  }
}