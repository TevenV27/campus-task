import { Injectable } from '@nestjs/common';
import { Tarea } from './tarea.model';

@Injectable()
export class TareasService {
  listar(): Tarea[] {
    return [
      { id: 1, titulo: 'Leer la guía de la clase 2' },
      { id: 2, titulo: 'Preparar el entorno de desarrollo' },
      { id: 3, titulo: 'Realizar una práctica corta de acercamiento' }
      { id: 4, titulo: 'Crear el proyecto de NestJS' },
      { id: 5, titulo: 'Instalar dependencias necesarias' },
      { id: 6, titulo: 'Configurar TypeScript y ESLint' },
      { id: 7, titulo: 'Implementar la estructura de carpetas' },
      { id: 8, titulo: 'Crear el módulo de tareas' },
      { id: 9, titulo: 'Definir el modelo de datos de tareas' },
      { id: 10, titulo: 'Implementar el servicio de tareas' },
      { id: 11, titulo: 'Crear el controlador de tareas' },
    ];
  }
}
