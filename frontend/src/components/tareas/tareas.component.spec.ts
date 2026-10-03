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

  const dosTareas: Tarea[] = [
    { id: 1, titulo: 'Leer la guía de la clase 2' },
    { id: 2, titulo: 'Preparar el entorno' },
  ];

  const buscarBoton = (raiz: HTMLElement, texto: string): HTMLButtonElement =>
    Array.from(raiz.querySelectorAll('button')).find(
      (boton) => boton.textContent?.trim() === texto,
    )!;

  const titulosEnPantalla = (raiz: HTMLElement): (string | null)[] =>
    Array.from(raiz.querySelectorAll('.titulo')).map((nodo) => nodo.textContent);

  const montarConDosTareas = (): HTMLElement => {
    tareasService.listar.and.returnValue(of(dosTareas));
    fixture = TestBed.createComponent(TareasComponent);
    fixture.detectChanges();
    return fixture.nativeElement;
  };

  beforeEach(async () => {
    tareasService = jasmine.createSpyObj('TareasService', [
      'listar',
      'crear',
      'actualizar',
      'eliminar',
    ]);
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

  it('edita una tarea: Editar, escribir el título y Guardar', () => {
    const elemento = montarConDosTareas();
    tareasService.actualizar.and.returnValue(
      of({ id: 1, titulo: 'Guía editada' }),
    );

    buscarBoton(elemento, 'Editar').click();
    fixture.detectChanges();

    const campo = elemento.querySelector('li input') as HTMLInputElement;
    expect(campo).not.toBeNull();
    campo.value = 'Guía editada';
    buscarBoton(elemento, 'Guardar').click();
    fixture.detectChanges();

    expect(tareasService.actualizar).toHaveBeenCalledWith(1, 'Guía editada');
    expect(titulosEnPantalla(elemento)).toEqual([
      'Guía editada',
      'Preparar el entorno',
    ]);
  });

  it('elimina una tarea al hacer clic en Eliminar', () => {
    const elemento = montarConDosTareas();
    tareasService.eliminar.and.returnValue(
      of({ id: 1, titulo: 'Leer la guía de la clase 2' }),
    );

    buscarBoton(elemento, 'Eliminar').click();
    fixture.detectChanges();

    expect(tareasService.eliminar).toHaveBeenCalledWith(1);
    expect(titulosEnPantalla(elemento)).toEqual(['Preparar el entorno']);
  });

  it('no cambia la lista y muestra un error si el backend falla al eliminar', () => {
    const elemento = montarConDosTareas();
    tareasService.eliminar.and.returnValue(
      throwError(() => new Error('404')),
    );

    buscarBoton(elemento, 'Eliminar').click();
    fixture.detectChanges();

    expect(titulosEnPantalla(elemento)).toEqual([
      'Leer la guía de la clase 2',
      'Preparar el entorno',
    ]);
    expect(elemento.querySelector('.error')?.textContent).toContain(
      'No se pudo eliminar',
    );
  });
});