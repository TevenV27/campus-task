import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
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
      'Preparar el entorno',]);
  });

  it('edita una tarea y muestra el título actualizado', () => {
    const tareaActualizada: Tarea = {id: 1, titulo: 'Guía de la clase actualizada',};
    tareasService.actualizar.and.returnValue(of(tareaActualizada));

    const elemento: HTMLElement = fixture.nativeElement;
    const botonEditar = Array.from(elemento.querySelectorAll('button'),
    ).find((boton) => boton.textContent?.trim() === 'Editar');

    expect(botonEditar).toBeDefined();
    botonEditar!.click();
    fixture.detectChanges();

    const inputs = elemento.querySelectorAll('input');
  // primer input de agregar una tarea
  // segundo aparece al editar
    expect(inputs.length).toBe(2);
    const inputEdicion = inputs[1] as HTMLInputElement;

    inputEdicion.value = 'Guía de la clase actualizada';
    inputEdicion.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const botonGuardar = Array.from(
      elemento.querySelectorAll('button'),
    ).find((boton) => boton.textContent?.trim() === 'Guardar');

    expect(botonGuardar).toBeDefined();

    botonGuardar!.click();
    fixture.detectChanges();

    expect(tareasService.actualizar).toHaveBeenCalledWith(
      1, 'Guía de la clase actualizada',
    );

    expect(elemento.querySelector('.titulo')?.textContent).toContain(
      'Guía de la clase actualizada',
    );
  });

  it('elimina una tarea y la quita de la pantalla', () => {
    tareasService.eliminar.and.returnValue(
      of({ id: 1, titulo: 'Leer la guía de la clase 2' }),);

    const elemento: HTMLElement = fixture.nativeElement;
    const botones = Array.from(elemento.querySelectorAll('button'),);
    const botonEliminar = botones.find((boton) => boton.textContent?.trim() === 'Eliminar',);
    expect(botonEliminar).toBeDefined();
    botonEliminar!.click();
    fixture.detectChanges();

    expect(tareasService.eliminar).toHaveBeenCalledWith(1);
    const titulos = Array.from(elemento.querySelectorAll('.titulo'),).map(
      (nodo) => nodo.textContent?.trim()
    );

    expect(titulos).not.toContain('Leer la guía de la clase 2');
  });

  it('si actualizar responde 404, avisa, sale de edición y recarga', () => {
    tareasService.actualizar.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 404 })),
    );
    tareasService.listar.calls.reset();

    const elemento: HTMLElement = fixture.nativeElement;

    const botonEditar = Array.from(elemento.querySelectorAll('button')).find(
      (boton) => boton.textContent?.trim() === 'Editar',);
    expect(botonEditar).toBeDefined();
    botonEditar!.click();
    fixture.detectChanges();

    // se consulta de nuevo
    const botonGuardar = Array.from(elemento.querySelectorAll('button')).find(
      (boton) => boton.textContent?.trim() === 'Guardar',
    );
    expect(botonGuardar).toBeDefined();
    botonGuardar!.click();
    fixture.detectChanges();

    expect(tareasService.actualizar).toHaveBeenCalledWith(
      1,
      'Leer la guía de la clase 2',
    );
    expect(tareasService.listar).toHaveBeenCalledTimes(1);
    expect(elemento.querySelector('.error')?.textContent).toContain(
      'La tarea ya no existe',
    );
    // solo queda el input de Agregar, salio del modo edicion
    expect(elemento.querySelectorAll('input').length).toBe(1);
  });

  it('si eliminar responde 404, avisa y recarga la lista', () => {
    tareasService.eliminar.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 404 })),
    );
    tareasService.listar.calls.reset();

    const elemento: HTMLElement = fixture.nativeElement;
    const botonEliminar = Array.from(elemento.querySelectorAll('button')).find(
      (boton) => boton.textContent?.trim() === 'Eliminar',
    );

    expect(botonEliminar).toBeDefined();
    botonEliminar!.click();
    fixture.detectChanges();

    expect(tareasService.eliminar).toHaveBeenCalledWith(1);
    expect(tareasService.listar).toHaveBeenCalledTimes(1);
    expect(elemento.querySelector('.error')?.textContent).toContain(
      'La tarea ya no existe',
    );
    expect(elemento.querySelectorAll('.titulo').length).toBe(1);
  });

  it('si eliminar falla con otro error, muestra mensaje genérico y no recarga', () => {
    tareasService.eliminar.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );
    tareasService.listar.calls.reset();

    const elemento: HTMLElement = fixture.nativeElement;
    const botones = Array.from(elemento.querySelectorAll('button'),);
    const botonEliminar = botones.find((boton) => boton.textContent?.trim() === 'Eliminar',);

    expect(botonEliminar).toBeDefined();
    botonEliminar!.click();
    fixture.detectChanges();

    expect(tareasService.listar).not.toHaveBeenCalled();
    expect(elemento.querySelector('.error')?.textContent).toContain(
      'No se pudo completar',
    );
    expect(elemento.querySelectorAll('.titulo').length).toBe(1);
  });

  it('no crea la tarea si el título está vacío', () => {
    const elemento: HTMLElement = fixture.nativeElement;
    elemento.querySelector('button')!.click();
    fixture.detectChanges();

    expect(tareasService.crear).not.toHaveBeenCalled();
    expect(elemento.querySelector('.error')?.textContent).toContain('vacío');
  });

  it('no guarda la edición si el título queda vacío', () => {
    const elemento: HTMLElement = fixture.nativeElement;
    const botonEditar = Array.from(elemento.querySelectorAll('button')).find(
      (boton) => boton.textContent?.trim() === 'Editar',
    );
    botonEditar!.click();
    fixture.detectChanges();

    const inputEdicion = elemento.querySelectorAll('input')[1] as HTMLInputElement;
    inputEdicion.value = '';
    inputEdicion.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const botonGuardar = Array.from(elemento.querySelectorAll('button')).find(
      (boton) => boton.textContent?.trim() === 'Guardar',
    );
    botonGuardar!.click();
    fixture.detectChanges();

    expect(tareasService.actualizar).not.toHaveBeenCalled();
    expect(elemento.querySelector('.error')?.textContent).toContain('vacío');
  });

});
