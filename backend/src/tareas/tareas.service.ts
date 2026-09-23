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

      { id: 11, titulo: 'Realizar una práctica corta de acercamiento' }
      { id: 12, titulo: 'Crear el proyecto de NestJS' },
      { id: 13, titulo: 'Instalar dependencias necesarias' },
      { id: 14, titulo: 'Configurar TypeScript y ESLint' },
      { id: 15, titulo: 'Implementar la estructura de carpetas' },
      { id: 16, titulo: 'Crear el módulo de tareas' },
      { id: 17, titulo: 'Definir el modelo de datos de tareas' },
      { id: 18, titulo: 'Implementar el servicio de tareas' },
      { id: 19, titulo: 'Crear el controlador de tareas' },
    ];
  }
}
