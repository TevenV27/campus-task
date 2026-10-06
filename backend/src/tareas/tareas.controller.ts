import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
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
  async actualizarTarea (@Param('id') idurl : string , @Body('titulo') Nuevotitulo : string) : Promise<Tarea>{
    const idNumero = parseInt(idurl,10);
    const TareaActualizada = await this.tareasService.actualizar(idNumero, Nuevotitulo);
    if (!TareaActualizada){
      throw new NotFoundException();
    }

    return TareaActualizada
  }

  @Delete(':id')
  async eliminarTarea (@Param('id') idurl : string ) : Promise<Tarea>{
    const idNumero = parseInt(idurl,10);
    const TareaEliminada = await this.tareasService.eliminar(idNumero);
    if (!TareaEliminada){
      throw new NotFoundException();
    }

    return TareaEliminada
  }
}