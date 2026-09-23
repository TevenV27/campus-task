import { Controller, Get } from '@nestjs/common';
import { Tarea } from './tarea.model';
import { TareasService } from './tareas.service';

@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  @Get()
  listar(): Tarea[] {
    return this.tareasService.listar();
  }
}
