import { Injectable } from '@nestjs/common';
import { Tarea } from './tarea.model';

@Injectable()
export class TareasService {
  listar(): Tarea[] {
    return [
      { id: 1, titulo: 'Leer la guía de la clase 2' },
      { id: 2, titulo: 'Preparar el entorno de desarrollo' },
      { id: 3, titulo: 'Hacer el ejercicio de la clase 2' },
      { id: 4, titulo: 'Ralizar tarea de la clase 2' },
      { id: 5, titulo: 'Hola Buenas' },
      { id: 7, titulo: 'Realizar una práctica corta de acercamiento' }
      { id: 8, titulo: 'Crear el proyecto de NestJS' },
      { id: 9, titulo: 'Instalar dependencias necesarias' },
      { id: 10, titulo: 'Configurar TypeScript y ESLint' },
      { id: 11, titulo: 'Implementar la estructura de carpetas' },
      { id: 12, titulo: 'Crear el módulo de tareas' },
      { id: 13, titulo: 'Definir el modelo de datos de tareas' },
      { id: 14, titulo: 'Implementar el servicio de tareas' },
      { id: 15, titulo: 'Crear el controlador de tareas' },
    ];
  }
}
