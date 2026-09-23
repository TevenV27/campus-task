// @ts-ignore: suppress missing module error for @nestjs/common in editor environment
import { Module } from '@nestjs/common';
import { TareasController } from './tareas.controller';
import { TareasService } from './tareas.service';

@Module({
  controllers: [TareasController],
  providers: [TareasService],
})
export class TareasModule {}
