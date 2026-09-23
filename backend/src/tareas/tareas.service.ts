import { Injectable } from '@nestjs/common';
import { Tarea } from './tarea.model';

@Injectable()
export class TareasService {
  listar(): Tarea[] {
    return [
      { id: 1, titulo: 'Leer la guía de la clase 2' },
      { id: 2, titulo: 'Preparar el entorno de desarrollo' },
      { id: 3, titulo: 'Instalar dependencias' }, 
      { id: 4, titulo: 'Configurar el proyecto' },
      { id: 5, titulo: 'Escribir el código base' },
      { id: 6, titulo: 'Realizar pruebas unitarias' },
      { id: 7, titulo: 'Documentar el proyecto' },
      { id: 8, titulo: 'Implementar la funcionalidad principal' },
      { id: 9, titulo: 'Optimizar el rendimiento' },
      { id: 10, titulo: 'Desplegar la aplicación' },

    ];
  }
}
