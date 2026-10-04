# ENTREGA — Taller CampusTasks

## 1. Datos

- **Integrantes:**
  - Karen Sofía López Botero — 2459519
  - Juan Esteban Pérez Ramírez — 2459486
- **Fecha de entrega:** [DD de octubre de 2026]
- **Nombre de la rama:** taller/actualizar-eliminar-tareas/klopez-pereziño

## 2. Puesta en marcha

### 2.1 Instalación de PostgreSQL

Se busco en internet el intalador de postgresql y se instalo la version 18.6, creando el super usuario y la contraseña maestra respectiva para cada dispositivo, despues de eso, se comprobó que el servicio estaba arriba con psql -U <usuario> -h 127.0.0.1 -p 5432 -d postgres.

### 2.2 Creación de la base de datos y la tabla

Se creó la base campus_tasks y dentro de ella la tabla tareas con las columnas id y título, siguiendo el paso 3 del taller:

    CREATE DATABASE campus_tasks;
    \c campus_tasks
    CREATE TABLE tareas (id SERIAL PRIMARY KEY, título TEXT NOT NULL);
    INSERT INTO tareas (título) VALUES
      ('Leer la guía de la clase 2'),
      ('Preparar el entorno de desarrollo');

Comprobación con SELECT * FROM tareas; mostrando las dos filas iniciales.

![alt text](image.png)

### 2.3 Archivo backend/.env

Se creó el archivo backend/.env con las cinco variables que usa DatabaseService:

    DB_HOST=...
    DB_PORT=...
    DB_USER=...
    DB_PASSWORD=...
    DB_NAME=...

### 2.4 Comprobación del backend

Desde backend/, con npm run start:dev en marcha, se abrió http://localhost:3000/tareas y la API devolvió el JSON con las dos tareas iniciales.

![alt text](<Captura de pantalla 2026-10-04 125718.png>)

### 2.5 Comprobación del frontend

Desde frontend/, con npm start en marcha, se abrió http://localhost:4200 y la lista mostró las dos tareas, con el campo de texto y el botón Agregar funcionando.

![alt text](image-1.png)

## 3. Lectura de los ejemplos

Antes de implementar, se leyeron con cuidado los tres archivos de prueba que ya trae el repositorio:

- **backend/src/tareas/tareas.service.spec.ts** 
pruebas unitarias. Se entendió que reemplazan DatabaseService por un objeto simulado cuyo método query es un jest.fn(), y que verifican tanto el valor devuelto por el método del servicio como los argumentos exactos con los que se llamó a query.
- **backend/src/tareas/tareas.integration.spec.ts**
 pruebas de integración. Se entendió que levantan un TestingModule con el controlador, el servicio y un DatabaseService simulado, hacen peticiones HTTP reales con supertest y verifican el código de estado, el cuerpo de la respuesta y los argumentos de query.
- **frontend/src/components/tareas/tareas.component.spec.ts**
 prueba de componente con Jasmine y Karma. Se entendió que el servicio HTTP se reemplaza por un spy, que se simulan clics del usuario y se verifica tanto que el spy fue llamado con los argumentos correctos como lo que aparece en pantalla.

**Patrón reutilizado:** todas las pruebas siguen tres pasos, preparar, ejecutar, verificar. Se reutilizó exactamente ese patrón en las pruebas nuevas, tanto en backend como en frontend, siguiendo los archivos de ejemplo y sin basarse en backend/test/app.e2e-spec.ts.

## 4. Implementación

### 4.1 Backend

**Métodos existentes (se mantienen sin cambios):**

En `backend/src/tareas/tareas.service.ts` ya existían los métodos `listar` y `crear`, que se dejaron intactos:

    async listar(): Promise<Tarea[]> {
      const resultado = await this.db.query<Tarea>(
        'SELECT id, titulo FROM tareas ORDER BY id',
      );
      return resultado.rows;
    }

    async crear(titulo: string): Promise<Tarea> {
      const resultado = await this.db.query<Tarea>(
        'INSERT INTO tareas (titulo) VALUES ($1) RETURNING id, titulo',
        [titulo],
      );
      return resultado.rows[0];
    }

**Método para editar:**

      async edicion(id:number, titulo:string): Promise<Tarea> {
            const resultado = await this.db.query<Tarea>(
                  'UPDATE tareas SET titulo = $1 WHERE id = $2 RETURNING id, titulo',
                  [titulo, id],
            );
            return resultado.rows[0];
      }

Ejecuta un `UPDATE` parametrizado que cambia el título de la tarea cuyo `id` coincide con el que llega por la URL y devuelve la fila actualizada gracias a `RETURNING id, titulo`. Si el `id` no existe en la tabla, el `UPDATE` no afecta ninguna fila y `resultado.rows[0]` queda como `undefined`.

**Método para eliminar:**

    async eliminar(id: number): Promise<void> {
      await this.db.query(
        'DELETE FROM tareas WHERE id = $1',
        [id],
      );
    }

Ejecuta un `DELETE` parametrizado que borra la tarea con el `id` recibido. La consulta usa `$1` como marcador de posición para evitar inyección SQL.

**Rutas en el controlador (`backend/src/tareas/tareas.controller.ts`):**

    @Patch(':id')
    async actualizar(
      @Param('id') id: string,
      @Body('titulo') titulo: string,
    ): Promise<Tarea> {
      const tarea = await this.tareasService.actualizar(Number(id), titulo);
      if (!tarea) {
        throw new NotFoundException();
      }
      return tarea;
    }

    @Delete(':id')
    async eliminar(@Param('id') id: string) {
      const tarea = await this.tareasService.eliminar(Number(id));
      if (!tarea) {
        throw new NotFoundException();
      }
      return tarea;
    }

**Justificación de las dos decisiones que pide el taller:**

**Conversión del `:id` de string a number.** El parámetro de ruta `:id` llega siempre como texto porque la URL es una cadena. En el controlador se convierte con `Number(id)` antes de llamar al servicio, para que este reciba el tipo `number` que declara su firma (`actualizar(id: number, ...)` y `eliminar(id: number)`). Así el servicio queda desacoplado de cómo llega el identificador por HTTP y se evitan comparaciones o consultas con tipos incorrectos.

**Detección del 404 cuando la tarea no existe.** El controlador verifica `if (!tarea)` y en ese caso lanza `NotFoundException`, que NestJS traduce automáticamente a una respuesta HTTP **404 Not Found**. La idea es que el servicio se encargue solo de la operación en la base de datos y devuelva la fila afectada (o `undefined` si no hubo ninguna), mientras que el controlador decide el código de estado según el resultado. De esta forma la lógica HTTP queda separada de la lógica de acceso a datos.

### 4.2 Frontend

**Métodos nuevos en el servicio HTTP (`frontend/src/components/tareas/tareas.service.ts`):**

    actualizar(id: number, titulo: string): Observable<Tarea> {
      return this.http.patch<Tarea>(`${this.apiUrl}/tareas/${id}`, { titulo });
    }

    eliminar(id: number): Observable<Tarea> {
      return this.http.delete<Tarea>(`${this.apiUrl}/tareas/${id}`);
    }

Ambos métodos siguen el mismo patrón que el método `crear` que ya existía: reciben los datos necesarios, construyen la URL con el `id` interpolado y devuelven un `Observable<Tarea>` con la respuesta del backend. El de editar usa `PATCH` y envía el nuevo título en el cuerpo; el de eliminar usa `DELETE` sin cuerpo.

**Cambios en `TareasComponent` (`frontend/src/components/tareas/tareas.component.ts`):**

    editar(tarea: Tarea) {
      const nuevoTitulo = window.prompt('Nuevo título:', tarea.titulo);

      if (!nuevoTitulo || nuevoTitulo.trim() === '') {
        return;
      }

      this.tareasService.actualizar(tarea.id, nuevoTitulo.trim()).subscribe((tareaActualizada) => {
        this.tareas.update((tareas) =>
          tareas.map((t) =>
            t.id === tareaActualizada.id ? tareaActualizada : t
          )
        );
      });
    }

    eliminar(tarea: Tarea) {
      this.tareasService.eliminar(tarea.id).subscribe((tareaEliminada) => {
        this.tareas.update((tareas) =>
          tareas.filter((t) => t.id !== tareaEliminada.id)
        );
      });
    }

El método `editar` abre un cuadro de diálogo del navegador con `window.prompt`, mostrando el título actual como valor por defecto. Si el usuario cancela o deja el campo vacío, el método retorna sin hacer nada. Si escribe un título, se llama al servicio con el `id` de la tarea y el título nuevo (sin espacios sobrantes, gracias a `.trim()`).

El método `eliminar` llama directamente al servicio con el `id` de la tarea seleccionada.

**Cambios en la plantilla (`frontend/src/components/tareas/tareas.component.html`):**

Dentro del `@for` que recorre las tareas, cada `li` incluye dos botones nuevos, con los textos exactos que pide el taller:

    <button (click)="editar(tarea)">Editar</button>
    <button (click)="eliminar(tarea)">Eliminar</button>

**Actualización de la lista solo tras la respuesta del backend.** Tanto en `editar` como en `eliminar`, la lista se modifica **dentro del callback del `subscribe`**, es decir, solo cuando el backend responde con éxito:

- En `editar` se reemplaza la tarea editada por la que devuelve el backend, usando `tareas.map` y comparando por `id`. Así las demás tareas no se tocan.
- En `eliminar` se quita esa tarea del arreglo con `tareas.filter`, comparando por `id`. Las demás siguen visibles.

Si la petición falla, el callback de éxito no se ejecuta y la lista queda intacta. Esto garantiza que la interfaz nunca muestre un cambio que el backend no haya confirmado.

**Decisión ante un error del backend (por ejemplo 404).** El `subscribe` solo tiene callback de éxito, así que si el backend responde con error la lista en pantalla no cambia y no queda inconsistente con la base de datos. Se decidió no mostrar un mensaje emergente adicional para mantener la interfaz simple, priorizando que la lista refleje siempre lo que está confirmado en el backend.

## 5. Pruebas

En el pdf, que esta en la misma carpeta que este .md se encuentran tanto los pantallazos como la explicacion de cada prueba para evitar redundancia y que sea mas facil de calificar

## 6. Git

Comandos usados para crear la rama, hacer commit y subirla:

    git checkout master
    git pull
    git checkout -b taller/actualizar-eliminar-tareas/klopez-pereziño
    git status
    git add .
    git commit -m "Taller raelizado con todos los requerimientos"
    git push -u origin taller/actualizar-eliminar-tareas/klopez-pereziño

URL de la rama: https://github.com/TevenV27/campus-task/tree/taller/actualizar-eliminar-tareas/klopez-perezi%C3%B1o

Verificación de que .env no quedó en el repositorio: se ejecutó git status antes de cada commit y el archivo .env no apareció; además está incluido en .gitignore.