# ENTREGA — Taller 1: CampusTasks

## 1. Datos

**Integrantes**

- Maria Fernanda Betancourt — 2459510
- Kevin Andres Rosero — 2459554

**Fecha:** 6 de octubre de 2026

**Rama:** `taller/Rosero-Betancourt`

---

## 2. Puesta en marcha

### Node.js

Se utilizó Node.js 24.x.

```text
Node.js: v24.19.0
```

La versión se comprobó con:

```bash
node -v
npm -v
```

### PostgreSQL

Se creó la base de datos `campus_tasks` y la tabla `tareas`:

```sql
CREATE DATABASE campus_tasks;

\c campus_tasks

CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL
);
```

Se insertaron los datos iniciales:

```sql
INSERT INTO tareas (titulo) VALUES
('Leer la guía de la clase 2'),
('Preparar el entorno de desarrollo');
```

La base de datos se comprobó mediante:

```sql
SELECT * FROM tareas;
```

### Backend

Se creó `backend/.env` con las variables:

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

El archivo `.env` no fue incluido en Git.

Desde `backend` se ejecutó:

```bash
npm ci
npm run start:dev
```

El backend quedó disponible en:

```text
http://localhost:3000
```

Se comprobó la ruta:

```text
http://localhost:3000/tareas
```

obteniendo las dos tareas iniciales.

### Frontend

Desde `frontend` se ejecutó:

```bash
npm ci
npm start
```

El frontend quedó disponible en:

```text
http://localhost:4200
```

Se comprobó que las tareas aparecen correctamente en la interfaz.

---

## 3. Lectura de los ejemplos

Se revisaron los archivos:

```text
backend/src/tareas/tareas.service.spec.ts
backend/src/tareas/tareas.integration.spec.ts
frontend/src/components/tareas/tareas.component.spec.ts
```

### Prueba unitaria

La prueba unitaria llama directamente a `TareasService` y utiliza un `mock` de `DatabaseService`. Se verifica el resultado del método y la consulta SQL con sus parámetros.

Este patrón se reutilizó para `actualizar` y `eliminar`.

### Prueba de integración

La prueba de integración realiza una petición HTTP al controlador y verifica la ruta, el método, el código de estado, la respuesta y los parámetros enviados a la base de datos simulada.

Este patrón se reutilizó para `PATCH /tareas/:id` y `DELETE /tareas/:id`.

### Prueba de componente

La prueba de componente monta `TareasComponent` y utiliza un `spy` para simular el servicio HTTP. Se simulan acciones del usuario y se verifica la llamada al servicio y el resultado mostrado en pantalla.

Este patrón se reutilizó para editar y eliminar tareas.

---

## 4. Implementación

### Backend

En `tareas.service.ts` se agregaron los métodos:

```ts
actualizar(id: number, titulo: string): Promise<Tarea>
eliminar(id: number): Promise<Tarea>
```

Para actualizar se utilizó:

```sql
UPDATE tareas
SET titulo = $1
WHERE id = $2
RETURNING id, titulo
```

Para eliminar se utilizó:

```sql
DELETE FROM tareas
WHERE id = $1
RETURNING id, titulo
```

Las consultas utilizan parámetros posicionales para evitar concatenar directamente los valores en el SQL.

En `tareas.controller.ts` se agregaron:

```text
PATCH /tareas/:id
DELETE /tareas/:id
```

El parámetro `:id` llega como texto desde la URL, por lo que se convierte a número mediante:

```ts
Number(id)
```

Para determinar si la tarea existe se verifica el resultado del servicio:

```ts
if (!tarea) {
    throw new NotFoundException();
}
```

Si existe, la ruta responde `200`. Si no existe, responde `404`.

### Frontend

En `tareas.service.ts` se agregaron los métodos para realizar:

```text
PATCH /tareas/:id
DELETE /tareas/:id
```

En `TareasComponent` se implementó la edición y eliminación dentro de la lista existente.

Para editar:

1. Se pulsa `Editar`.
2. Se modifica el título.
3. Se pulsa `Guardar`.
4. Se envía el cambio al backend.
5. La tarea se actualiza con la respuesta del backend.

Para eliminar:

1. Se pulsa `Eliminar`.
2. Se envía el `id` al backend.
3. La tarea desaparece de la lista cuando la operación es exitosa.

Se utilizaron exactamente los botones `Editar`, `Guardar` y `Eliminar`.

La lista solo se modifica después de una respuesta exitosa del backend. Si ocurre un error, la lista mantiene su estado anterior.

---

## 5. Pruebas

### Backend

Se agregaron pruebas unitarias para:

- `actualizar`
- `eliminar`

También se agregaron pruebas de integración para:

- `PATCH` con tarea existente → `200`.
- `PATCH` con tarea inexistente → `404`.
- `DELETE` con tarea existente → `200`.
- `DELETE` con tarea inexistente → `404`.

Resultado:

```text
Test Suites: 2 passed, 2 total
Tests:       10 passed, 10 total
```

### Frontend

Se agregaron pruebas de componente para:

- Editar una tarea.
- Eliminar una tarea.

Las pruebas existentes de listar y agregar continuaron funcionando.

Resultado:

```text
Chrome: Executed 4 of 4 SUCCESS
TOTAL: 4 SUCCESS
```

También se realizó la prueba manual desde:

```text
http://localhost:4200
```

comprobando la edición y eliminación de tareas contra el backend real.

---

## 6. Git

Se creó la rama:

```bash
git switch -c taller/Rosero-Betancourt
```

Antes del commit se comprobó mediante `git status` que `backend/.env` no estuviera incluido.

El commit realizado fue:

```text
a46f4eb Implementar edición y eliminación de tareas
```

La rama se publicó mediante:

```bash
git push -u origin taller/Rosero-Betancourt
```

**Repositorio:** https://github.com/TevenV27/campus-task

**Rama:** `taller/Rosero-Betancourt`

Estado final:

```text
Your branch is up to date with 'origin/taller/Rosero-Betancourt'.

nothing to commit, working tree clean
```