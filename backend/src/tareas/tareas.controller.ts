import { Body, Controller, Get, Post, NotFoundException,Param,ParseIntPipe,Patch, Delete,} from '@nestjs/common';
import { Tarea } from './tarea.model';
import { TareasService } from './tareas.service';

@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) { }

  @Get()
  listar(): Promise<Tarea[]> {
    return this.tareasService.listar();
  }

  @Post()
  crear(@Body('titulo') titulo: string): Promise<Tarea> {
    return this.tareasService.crear(titulo);
  }
  @Patch(':id')
  async actualizar (
    @Param('id', ParseIntPipe) id: number,
    @Body('titulo') titulo: string,
  ){
    const tarea = await this.tareasService.actualizar(id,titulo);
    if(!tarea){
      throw new NotFoundException(`Tarea con id ${id} no existe`);
    }
    return tarea;
  }
  @Delete(':id')
  async eliminar(@Param('id', ParseIntPipe) id: number){
    const tarea = await this.tareasService.eliminar(id);
    if(!tarea){
      throw new NotFoundException(`Tarea con id ${id} no existe`);
    }
    return tarea;
  }
}
