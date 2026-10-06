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
    tareasService = jasmine.createSpyObj('TareasService', ['listar', 'crear','actualizar','eliminar']);
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

  it('debería eliminar la tarea al hacer clic en Eliminar', () => {
    tareasService.eliminar.and.returnValue(
      of({ id: 1, titulo: 'Leer la guía de la clase 2' })
    );

    const elemento: HTMLElement = fixture.nativeElement;
    
    const botonEliminar = Array.from(elemento.querySelectorAll('button'))
      .find(btn => btn.textContent === 'Eliminar');
    
    botonEliminar!.click();
    fixture.detectChanges();

    expect(tareasService.eliminar).toHaveBeenCalledWith(1);
    
    const titulos = elemento.querySelectorAll('.titulo');
    expect(titulos.length).toBe(0);
  });

  it('debería actualizar la tarea al hacer clic en Editar y luego Guardar', () => {
    tareasService.actualizar.and.returnValue(
      of({ id: 1, titulo: 'Tarea modificada' })
    );

    const elemento: HTMLElement = fixture.nativeElement;

    const botonEditar = Array.from(elemento.querySelectorAll('button'))
      .find(btn => btn.textContent === 'Editar');
    
    botonEditar!.click();
    fixture.detectChanges();

    const inputs = elemento.querySelectorAll('input');
    const inputEditar = inputs[inputs.length - 1] as HTMLInputElement;
    inputEditar.value = 'Tarea modificada';

    const botonGuardar = Array.from(elemento.querySelectorAll('button'))
      .find(btn => btn.textContent === 'Guardar');
    
    botonGuardar!.click();
    fixture.detectChanges();

    expect(tareasService.actualizar).toHaveBeenCalledWith(1, 'Tarea modificada');

    const tituloActualizado = elemento.querySelector('.titulo')?.textContent;
    expect(tituloActualizado).toBe('Tarea modificada');
  });
});