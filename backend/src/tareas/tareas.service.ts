import { Injectable } from '@nestjs/common';
import { Tarea } from './tarea.model';

@Injectable()
export class TareasService {
  listar(): Tarea[] {
    return [
      { id: 1, titulo: 'Leer la guía de la clase 2' },
      { id: 2, titulo: 'Preparar el entorno de desarrollo' },
      { id: 3, titulo: 'Ralizar tarea de la clase 2' },
      { id: 4, titulo: 'Hola Buenas' },
      { id: 5, titulo: 'Realizar una práctica corta de acercamiento' }
      { id: 6, titulo: 'Crear el proyecto de NestJS' },
      { id: 7, titulo: 'Instalar dependencias necesarias' },
      { id: 8, titulo: 'Configurar TypeScript y ESLint' },
      { id: 9, titulo: 'Implementar la estructura de carpetas' },
      { id: 10, titulo: 'Crear el módulo de tareas' },
      { id: 11, titulo: 'Definir el modelo de datos de tareas' },
      { id: 12, titulo: 'Implementar el servicio de tareas' },
      { id: 13, titulo: 'Crear el controlador de tareas' },
    ];
  }
}
