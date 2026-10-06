import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
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
    @Param('id', ParseIntPipe) id: number,
    @Body('titulo') titulo: string,
  ) {
    return this.tareasService.actualizar(id, titulo);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.tareasService.eliminar(id);
  }
}
