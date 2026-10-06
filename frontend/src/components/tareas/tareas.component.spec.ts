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

  const dosTareas: Tarea[] = [
    { id: 1, titulo: 'Leer la guía de la clase 2' },
    { id: 2, titulo: 'Preparar el entorno de desarrollo' },
  ];

  function renderizarConDosTareas(): HTMLElement {
    tareasService.listar.and.returnValue(of(dosTareas));
    fixture = TestBed.createComponent(TareasComponent);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  function botonDe(li: Element, texto: string): HTMLButtonElement {
    return Array.from(li.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === texto,
    )!;
  }

  function titulosEnPantalla(elemento: HTMLElement): (string | null)[] {
    return Array.from(elemento.querySelectorAll('.titulo')).map(
      (nodo) => nodo.textContent,
    );
  }

  it('edita una tarea al pulsar Editar y Guardar', () => {
    tareasService.actualizar.and.returnValue(
      of({ id: 1, titulo: 'Guía leída' }),
    );
    const elemento = renderizarConDosTareas();
    botonDe(elemento.querySelectorAll('li')[0], 'Editar').click();
    fixture.detectChanges();
    const input = elemento.querySelectorAll('li')[0].querySelector('input')!;
    input.value = 'Guía leída';
    botonDe(elemento.querySelectorAll('li')[0], 'Guardar').click();
    fixture.detectChanges();
    expect(tareasService.actualizar).toHaveBeenCalledWith(1, 'Guía leída');
    expect(titulosEnPantalla(elemento)).toEqual([
      'Guía leída',
      'Preparar el entorno de desarrollo',
    ]);
  });

  it('elimina una tarea al pulsar Eliminar', () => {
    tareasService.eliminar.and.returnValue(
      of({ id: 1, titulo: 'Leer la guía de la clase 2' }),
    );
    const elemento = renderizarConDosTareas();
    botonDe(elemento.querySelectorAll('li')[0], 'Eliminar').click();
    fixture.detectChanges();
    expect(tareasService.eliminar).toHaveBeenCalledWith(1);
    expect(titulosEnPantalla(elemento)).toEqual([
      'Preparar el entorno de desarrollo',
    ]);
  });
});
