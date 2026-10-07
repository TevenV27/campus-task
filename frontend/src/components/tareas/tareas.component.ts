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
  tituloEditado = signal('');
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

  editar(tarea: Tarea){
    this.editandoId.set(tarea.id); 
    this.tituloEditado.set(tarea.titulo);
  }

  guardar(id: number) {
  this.tareasService.actualizar(id, this.tituloEditado()).subscribe({
    next: (actualizada) => {
      this.tareas.update((tareas) =>
        tareas.map((t) => (t.id === actualizada.id ? actualizada : t)),
      );
      this.editandoId.set(null);
      this.error.set('');
    },
    error: () => this.error.set('No se pudo actualizar la tarea'),
  });
}

  
  eliminar(id: number) {
    this.tareasService.eliminar(id).subscribe({
      next:() => {
        this.tareas.update((tareas) => tareas.filter((t) => t.id !== id));
        this.error.set('');
      },
        error: () => this.error.set('No se pudo eliminar la tarea'),
    }); 
  }
  
}
