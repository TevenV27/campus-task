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
    tareasService = jasmine.createSpyObj('TareasService', ['listar', 'crear', 'actualizar' , 'eliminar']);
    tareasService.listar.and.returnValue(of(iniciales));
    

    await TestBed.configureTestingModule({
      imports: [TareasComponent],
      providers: [{ provide: TareasService, useValue: tareasService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TareasComponent);
    fixture.detectChanges();
  });

    function boton(texto: string): HTMLButtonElement {
    const elemento: HTMLElement = fixture.nativeElement;
    const encontrado = Array.from(elemento.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === texto,
    );
    expect(encontrado).withContext(`botón ${texto}`).toBeDefined();
    return encontrado as HTMLButtonElement;
  }

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

    it('actualiza el título al pulsar Editar y Guardar', () => {
    tareasService.actualizar.and.returnValue(
      of({ id: 1, titulo: 'Título editado' }),
    );
    const elemento: HTMLElement = fixture.nativeElement;

    boton('Editar').click();
    fixture.detectChanges();

    const input = elemento.querySelector<HTMLInputElement>('li input');
    expect(input).not.toBeNull();
    input!.value = 'Título editado';
    boton('Guardar').click();
    fixture.detectChanges();

    expect(tareasService.actualizar).toHaveBeenCalledWith(1, 'Título editado');
    const titulos = Array.from(elemento.querySelectorAll('.titulo')).map(
      (nodo) => nodo.textContent,
    );
    expect(titulos).toEqual(['Título editado']);
  });

    it('quita la tarea de la lista al pulsar Eliminar', () => {
    tareasService.listar.and.returnValue(
      of([
        { id: 1, titulo: 'Leer la guía de la clase 2' },
        { id: 2, titulo: 'Preparar el entorno' },
      ]),
    );
    tareasService.eliminar.and.returnValue(
      of({ id: 1, titulo: 'Leer la guía de la clase 2' }),
    );
    fixture = TestBed.createComponent(TareasComponent);
    fixture.detectChanges();
    const elemento: HTMLElement = fixture.nativeElement;

    boton('Eliminar').click();
    fixture.detectChanges();

    expect(tareasService.eliminar).toHaveBeenCalledWith(1);
    const titulos = Array.from(elemento.querySelectorAll('.titulo')).map(
      (nodo) => nodo.textContent,
    );
    expect(titulos).toEqual(['Preparar el entorno']);
  });
});
