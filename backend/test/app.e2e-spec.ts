import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('TareasController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/tareas (GET)', () => {
    return request(app.getHttpServer())
      .get('/tareas')
      .expect(200)
      .expect([
        { id: 1, titulo: 'Leer la guía de la clase 2' },
        { id: 2, titulo: 'Preparar el entorno de desarrollo' },
        { id: 3, titulo: 'Instalar NestJS' },
      ]);
  });

  afterEach(async () => {
    await app.close();
  });
});
