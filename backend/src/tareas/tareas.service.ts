import { Injectable } from '@nestjs/common';
import { Tarea } from './tarea.model';

@Injectable()
export class TareasService {
  listar(): Tarea[] {
    return [
      { id: 1, titulo: 'Leer la guía de la clase 2' },
      { id: 2, titulo: 'Preparar el entorno de desarrollo' },
      { id: 3, titulo: 'hacer algo xd'}
      { id: 4, titulo: 'Realizar una práctica corta de acercamiento' }
      { id: 5, titulo: 'Crear el proyecto de NestJS' },
      { id: 6, titulo: 'Instalar dependencias necesarias' },
      { id: 7, titulo: 'Configurar TypeScript y ESLint' },
      { id: 8, titulo: 'Implementar la estructura de carpetas' },
      { id: 9, titulo: 'Crear el módulo de tareas' },
      { id: 10, titulo: 'Definir el modelo de datos de tareas' },
      { id: 11, titulo: 'Implementar el servicio de tareas' },
      { id: 12, titulo: 'Crear el controlador de tareas' },
    ];
  }
}
