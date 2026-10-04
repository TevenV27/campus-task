import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Tarea } from './tarea.model';
import { TareasComponent } from './tareas.component';
import { TareasService } from './tareas.service';

describe('TareasComponent', () => {
  let fixture: ComponentFixture<TareasComponent>;
  let tareasService: jasmine.SpyObj<TareasService>;

  const iniciales: Tarea[] = [
    { id: 1, titulo: 'Leer la guía de la clase 2' },
  ];

  beforeEach(async () => {
    tareasService = jasmine.createSpyObj('TareasService', ['listar', 'crear', 'actualizar', 'eliminar']);
    tareasService.listar.and.returnValue(of(iniciales));

    await TestBed.configureTestingModule({
      imports: [TareasComponent],
      providers: [{ provide: TareasService, useValue: tareasService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TareasComponent);
    fixture.detectChanges();
  });

  it('muestra el id y el título de cada tarea', () => {
    const elemento: HTMLElement = fixture.nativeElement;

    expect(elemento.querySelector('.numero')?.textContent).toContain('1');
    expect(elemento.querySelector('.titulo')?.textContent).toContain(
      'Leer la guía de la clase 2',
    );
    expect(tareasService.listar).toHaveBeenCalled();
  });

  it('agrega la tarea creada al hacer clic en Agregar', () => {
    tareasService.crear.and.returnValue(
      of({ id: 2, titulo: 'Preparar el entorno' }),
    );

    const elemento: HTMLElement = fixture.nativeElement;
    const input = elemento.querySelector('input');
    expect(input).not.toBeNull();
    input!.value = 'Preparar el entorno';
    elemento.querySelector('button')!.click();
    fixture.detectChanges();

    expect(tareasService.crear).toHaveBeenCalledWith('Preparar el entorno');
    const titulos = Array.from(elemento.querySelectorAll('.titulo')).map(
      (nodo) => nodo.textContent,
    );
    expect(titulos).toEqual([
      'Leer la guía de la clase 2',
      'Preparar el entorno',
    ]);
  });

  it('edita una tarea al hacer clic en Editar', () => {
    spyOn(window, 'prompt').and.returnValue('Tarea actualizada');
    tareasService.actualizar.and.returnValue(
      of({ id: 1, titulo: 'Tarea actualizada' }),
    );

    const elemento: HTMLElement = fixture.nativeElement;
    const botonEditar = Array.from(
      elemento.querySelectorAll('button'),
    ).find((boton) => boton.textContent?.trim() === 'Editar');

    expect(botonEditar).not.toBeUndefined();
    botonEditar!.click();
    fixture.detectChanges();
    expect(window.prompt).toHaveBeenCalledWith(
      'Nuevo título:',
      'Leer la guía de la clase 2',
    );
    expect(tareasService.actualizar).toHaveBeenCalledWith(
      1,
      'Tarea actualizada',
    );
    expect(elemento.querySelector('.titulo')?.textContent).toContain(
      'Tarea actualizada',
    );
  });

  it('elimina una tarea al hacer clic en Eliminar', () => {
    tareasService.eliminar.and.returnValue(
      of({ id: 1, titulo: 'Leer la guía de la clase 2' }),
    );

    const elemento: HTMLElement = fixture.nativeElement;

    const botonEliminar = Array.from(
      elemento.querySelectorAll('button'),
    ).find((boton) => boton.textContent?.trim() === 'Eliminar');

    expect(botonEliminar).not.toBeUndefined();

    botonEliminar!.click();
    fixture.detectChanges();

    expect(tareasService.eliminar).toHaveBeenCalledWith(1);

    expect(elemento.querySelector('.titulo')).toBeNull();
  });

});
