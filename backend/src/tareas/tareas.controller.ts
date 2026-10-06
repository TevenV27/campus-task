import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Tarea } from './tarea.model';
import { TareasService } from './tareas.service';

@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  @Get()
  listar(): Promise<Tarea[]> {
    return this.tareasService.listar();
  }

  @Post()
  crear(@Body('titulo') titulo: string): Promise<Tarea> {
    return this.tareasService.crear(titulo);
  }

  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body('titulo') titulo: string,
  ): Promise<Tarea> {
    return this.tareasService.actualizar(Number(id), titulo);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string): Promise<void> {
    await this.tareasService.eliminar(Number(id));
  }
}