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
    { id: 2, titulo: 'Preparar el entorno de desarrollo' },
  ];

  const boton = (texto: string): HTMLButtonElement =>
    Array.from(
      fixture.nativeElement.querySelectorAll('li button') as NodeListOf<HTMLButtonElement>,
    ).find((b) => b.textContent?.trim() === texto)!;

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
      'Preparar el entorno de desarrollo',
      'Preparar el entorno',
    ]);
  });

  it('edita el título al pulsar Editar y Guardar', () => {
    tareasService.actualizar.and.returnValue(
      of({ id: 1, titulo: 'Título nuevo' }),
    );
    const elemento: HTMLElement = fixture.nativeElement;

    boton('Editar').click();
    fixture.detectChanges();

    const input = elemento.querySelector<HTMLInputElement>('input.edicion');
    expect(input).not.toBeNull();
    input!.value = 'Título nuevo';
    boton('Guardar').click();
    fixture.detectChanges();

    expect(tareasService.actualizar).toHaveBeenCalledWith(1, 'Título nuevo');
    expect(elemento.querySelector('.titulo')?.textContent).toContain(
      'Título nuevo',
    );
  });

  it('elimina la tarea al pulsar Eliminar y deja las demás', () => {
    tareasService.eliminar.and.returnValue(of(iniciales[0]));
    const elemento: HTMLElement = fixture.nativeElement;

    boton('Eliminar').click();
    fixture.detectChanges();

    expect(tareasService.eliminar).toHaveBeenCalledWith(1);
    const titulos = Array.from(elemento.querySelectorAll('.titulo')).map(
      (nodo) => nodo.textContent,
    );
    expect(titulos).toEqual(['Preparar el entorno de desarrollo']);
  });  
});
