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
    { id: 2, titulo: 'Preparar el entorno' },
  ];

  // Busca un botón por su texto exacto dentro de un elemento.
  const boton = (raiz: ParentNode, texto: string): HTMLButtonElement =>
    Array.from(raiz.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === texto,
    ) as HTMLButtonElement;

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
      of({ id: 3, titulo: 'Nueva tarea' }),
    );

    const elemento: HTMLElement = fixture.nativeElement;
    const input = elemento.querySelector('input');
    expect(input).not.toBeNull();
    input!.value = 'Nueva tarea';
    elemento.querySelector('button')!.click();
    fixture.detectChanges();

    expect(tareasService.crear).toHaveBeenCalledWith('Nueva tarea');
    const titulos = Array.from(elemento.querySelectorAll('.titulo')).map(
      (nodo) => nodo.textContent,
    );
    expect(titulos).toEqual([
      'Leer la guía de la clase 2',
      'Preparar el entorno',
      'Nueva tarea',
    ]);
  });

  it('edita una tarea: llama al servicio y muestra el título devuelto', () => {
    tareasService.actualizar.and.returnValue(
      of({ id: 1, titulo: 'Guía leída' }),
    );
    const elemento: HTMLElement = fixture.nativeElement;
    const primera = elemento.querySelectorAll('li')[0];

    boton(primera, 'Editar').click();
    fixture.detectChanges();

    const campo = elemento.querySelector('li .editar-input') as HTMLInputElement;
    expect(campo).not.toBeNull();
    campo.value = 'Guía leída';
    boton(elemento.querySelectorAll('li')[0], 'Guardar').click();
    fixture.detectChanges();

    expect(tareasService.actualizar).toHaveBeenCalledWith(1, 'Guía leída');
    const titulos = Array.from(elemento.querySelectorAll('.titulo')).map(
      (nodo) => nodo.textContent,
    );
    expect(titulos).toEqual(['Guía leída', 'Preparar el entorno']);
    expect(elemento.querySelector('.editar-input')).toBeNull();
  });

  it('elimina una tarea: llama al servicio y la quita de la lista', () => {
    tareasService.eliminar.and.returnValue(
      of({ id: 1, titulo: 'Leer la guía de la clase 2' }),
    );
    const elemento: HTMLElement = fixture.nativeElement;

    boton(elemento.querySelectorAll('li')[0], 'Eliminar').click();
    fixture.detectChanges();

    expect(tareasService.eliminar).toHaveBeenCalledWith(1);
    const titulos = Array.from(elemento.querySelectorAll('.titulo')).map(
      (nodo) => nodo.textContent,
    );
    expect(titulos).toEqual(['Preparar el entorno']);
  });

  it('no cambia la lista y avisa si el backend responde 404 al eliminar', () => {
    tareasService.eliminar.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 404 })),
    );
    const elemento: HTMLElement = fixture.nativeElement;

    boton(elemento.querySelectorAll('li')[0], 'Eliminar').click();
    fixture.detectChanges();

    expect(elemento.querySelector('.error')?.textContent).toContain(
      'ya no existe',
    );
    // se vuelve a consultar la lista para resincronizar con el servidor
    expect(tareasService.listar).toHaveBeenCalledTimes(2);
  });
});