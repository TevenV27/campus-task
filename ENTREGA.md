# Entrega: Taller #1
## Miembros:
- Gabriel Bernal Rodriguez - 2459645

- Jose Manuel Castaño Rojas - 2459522

Fecha: 5 de Octubre, 2026

Rama: taller/actualizar-eliminar-tareas/gabrielbr-josemanuel

# //Puesta en marcha:
## [(Las capturas de pantalla se encuentran en la carpeta "evidencias-trabajo")](https://github.com/TevenV27/campus-task/blob/taller/actualizar-eliminar-tareas/gabrielbr-josemanuel/evidencias-trabajo/evidencias-trabajo.pdf)
- ### Node.js y npm:

Debido a que ya se contaba con **Node.js** que fue instalado previo a la asignación del taller en la clase anterior, se verificaron las versiones tanto de npm como de Node respectivamente **(v24.21.0 y v11.19.0)**.

- ### PSQL:

Nuevamente, debido a que el equipo en el cual se trabajo ya contaba con herramientas SQL (pgAdmin4 y Postgres) instaladas, se opto por confirmar su correcto funcionamiento para confirmar la conexión psql directamente con el powershell, arrojando los datos esperados en los parámetros del taller.

- ### Base de datos y tabla:

Se creo la base de datos en psql como se indico en el taller sin ningún inconveniente, igualmente se verifico que las dos tareas predeterminadas si se inicializaran usando el comando:

```
CREATE DATABASE campus_tasks;
\c campus_tasks
CREATE TABLE tareas (id SERIAL PRIMARY KEY, titulo TEXT NOT NULL);
INSERT INTO tareas (titulo) VALUES
('Leer la guía de la clase 2'),
('Preparar el entorno de desarrollo');
```

- ### Verificacion del backend:

Se comprobó de que las variables que se proveen en el repositorio tras clonar la rama Master son las mismas variables como se indican en el enunciado, en este caso, ``DB_host (127.0.0.1)``, ``DB_port (5432)``, ``DB_user`` y ``DB_password`` además del método Query para las consultas teniendo en cuenta las variables de entorno previamente mencionadas.

- ### Creacion del Env:

La creación del archivo .env tuvo en cuenta las variables usadas para la creación de usuario en cuanto a psql, (o pgAdmin4 respectivamente) se llevo a cabo dentro de la carpeta backend nuevamente como se indicaba en el taller para que esta quedara invisible una vez que se ejecute el gitignore dentro de la rama en la cual se trabajo, las variables ligadas a este archivo fueron las siguientes:

```
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[contraseña oculta]
DB_NAME=campus_tasks
```

- ### Comprobacion del backend:

Para la comprobación del backend se ejecuto el comando ``npm run start:dev`` el cual no arrojo ningún problema durante su procesamiento dentro de la terminal, mostrando los mensajes de confirmación para DatabaseModule, AppModule y TareasModule una vez que termino. Prosiguiendo, nos centramos en la rama Master para traer el link del ``localhost:3000`` y abrirlo dentro del navegador el cual funciono perfectamente como parte final de la comprobación al poder visualizarle el archivo JSON con las dos tareas que se crearon en la base de datos psql.

- ### Comprobacion del frontend:

Para la comprobación del frontend se uso el comando ``npm start``, no obstante, nos encontramos con algunas dificultades ya que este tiraba errores de compatibilidad respecto a la versión de Angular actual que no permitían cargar el ``localhost:4200``, por ende, simplemente se opto por correr los comandos de ``ng update @angular/cli @angular/core`` para migrar a la versión mas actual. Con este pequeño inconveniente solucionado, nuevamente se ejecuto npm start y esta vez se pudo visualizar la ventana del frontend al correr nuevamente el localhost.

- ### Pruebas:

Las pruebas tanto del backend como el frontend se realizaron con el npm test en donde las suites **(service.spec, integration.spec y component.spec)** no dieron ningún error y todos los procesos se ejecutaron correctamente. En el caso del frontend, la ventana simulada de Karma se abrió sin problema alguno y las conexiones fueron un exito.
# Lectura de los ejemplos
Al revisar los archivos de prueba provistos (`tareas.service.spec.ts`, `tareas.integration.spec.ts` y `tareas.component.spec.ts`), entendimos que el proyecto separa la verificación por capas utilizando objetos simulados para no depender de la base de datos o de la red. En el backend, usamos un *mock* de `query` y en el frontend un *spy* del servicio HTTP.

Para implementar las nuevas pruebas reutilizamos el patrón **"preparar, ejecutar, verificar"**:
1. **Preparar:** Configuramos qué deben devolver los mocks o spies (ej. la consulta SQL simulada) y renderizamos el estado inicial.
2. **Ejecutar:** Llamamos al método del servicio, enviamos la petición HTTP mediante Supertest, o simulamos un clic del usuario en la interfaz.
3. **Verificar:** Comprobamos con aserciones que los mocks recibieron los parámetros exactos y que la respuesta o la pantalla muestran el resultado correcto.

# Implementación

- # Backend:

En el apartado de ``tareas.service.ts`` se implementaron los nuevos métodos solicitados, actualizar que tendrá de parámetro **id** y **titulo** para cambiar el titulo de la tarea que se busca actualizar mientras que el método eliminar solo requeriría la id para posteriormente eliminarse. En el caso hipotético de que la id de una tarea no exista, ambos métodos devolverán undefined.
Para las rutas en ``tareas.controller.ts`` lo que se busco es agregarlas de tal manera que se asemejen a las demás añadidas en el apartado. Lo cual dejo como resultado las siguientes dos rutas:

```
PATCH/tareas/:id ---> si: 200, no: 404

DELETE/tareas/:id ---> si: 200, no: 404
```

En PATCH, si la tarea existe devuelve un **200** con la tarea actualizada. En DELETE, nuevamente devuelve un 200 con la tarea eliminada. Si la tarea no existe en ambos casos entonces arroja el error **404.**

- ### SQL:

El SQL agregado con los metodos agregados fueron los siguientes:

```sql
-- actualizar
UPDATE tareas SET titulo = $1 WHERE id = $2 RETURNING id, titulo

-- eliminar
DELETE FROM tareas WHERE id = $1 RETURNING id, titulo
```

Estas funciones usan consultas parametrizadas: eso significa que los valores viajan como parámetros posicionales ``([titulo, id] y [id])`` y nunca se concatenan dentro del texto SQL. Asi, sigue el mismo patron de crear y no tenemos que resolver problemas de inyecciones SQL.

- ### ¿Como se convirtio el ``:id`` a ``number``?

El ``:id`` llega como texto desde la URL. Para eso usamos ``ParseIntPipe`` en el parámetro **(@Param('id', ParseIntPipe) id: number)**, que lo convierte a entero antes de llamar al servicio. Si el valor no es un entero válido (por ejemplo, /tareas/abc), Nest responde 400 automáticamente, así el servicio siempre recibe un number real. 

- ### ¿Que hicimos para decidir el 404?

Para la decision de como implementar el error 404 en este taller, nos centramos en los resultados de consulta y manejarlo en tres sencillos pasos:

## Paso 1:

Teniendo en cuenta la implementacion de ``RETURNING``, si el ``UPDATE`` o el ``DELETE`` no encuentra ninguna fila con ese id, la consulta devuelve rows vacio.

## Paso 2:

Por ende, el servicio retorna ``rows[0]``, que en ese caso es undefined.

## Paso 3:

Finalmente, el controlador revisa el resultado: si es **undefined**, lanza ``NotFoundException``, que Nest convierte en una respuesta 404.

- # Frontend:

- ### Métodos HTTP y Botones Implementados 

```sql
actualizar(id: number, titulo: string): 

--Utiliza el método PATCH de HttpClient (this.http.patch) para enviar el nuevo titulo de la tarea en el cuerpo de la petición hacia el endpoint /tareas/${id}.

eliminar(id: number): 

--Emplea el método DELETE (this.http.delete) dirigido al endpoint /tareas/${id} para solicitar que se remueva el registro del backend.
```

- ### Botones añadidos a la vista (TareasComponent):

```sql
Editar: --Visible en modo lectura, ejecuta el evento (click)="iniciarEdicion(tarea.id)" para identificar la tarea seleccionada y cambiar la vista al formulario.

Eliminar: --Visible en modo lectura, dispara (click)="eliminar(tarea.id)" para iniciar la petición de borrado al servidor.

Guardar: --Visible unicamente en modo edicion, aqui llama a (click)="guardar(tarea.id, editInput.value)", capturando el texto tipeado a traves de la variable de referencia local #editInput.
```

- ### Si pasa un error:

En el caso hipotetico de que llegara a ocurrir un error 404 o cualquier fallo en las peticiones HTTP, la aplicacion captura la excepcion mediante el bloque error de la suscripcion y despliega un ``alert()`` nativo que advierte al usuario que la tarea no existe, ya fue eliminada o no se pudo actualizar. Simultaneamente, el detalle técnico se imprime mediante ``console.error``.

- ### Razonamiento de la logica:

Esta estrategia se planteo asi ya que bloquea las actualizaciones optimistas no verificadas. La lista visual manejada por el signal ``this.tareas`` se modifica estrictamente dentro del bloque next, lo que garantiza que la interfaz de usuario no muestre un cambio o borrado ficticio si el backend rechazó la accion. Adicionalmente, en el flujo de guardado fallido, el sistema ejecuta ``this.tareaEnEdicionId.set(null)`` para forzar el cierre del input de edicion y devolver la pantalla a un estado estable.

# Pruebas:

La ejecución de **Karma** y **Jasmine** finalizo con éxito indicando **4 specs, 0 failures** con un tiempo de ejecución de **0.145 segundos.** Las dos nuevas pruebas de componente operan de la siguiente manera:  

- ## Prueba de edicion ("edita una tarea tras pulsar Editar, cambiar el texto y pulsar Guardar"):

Aqui se busco simular la interacción completa del usuario configurando el espía ``tareasService.actualizar`` para retornar la tarea modificada. Busca el boton **"Editar"** en el **DOM** por su texto, simula el click y activa la deteccion de cambios de Angular para renderizar el input. Luego, inyecta el texto "Título actualizado", hace click en "Guardar" y verifica mediante aserciones (expect) que el servicio fue llamado con los argumentos correctos y que el nuevo título esta contenido en el DOM.  

- ## Prueba de eliminacion ("elimina una tarea de la lista tras pulsar Eliminar"): 

Evalúa que los elementos se remuevan de la interfaz. Se configura el espía correspondiente, localiza el boton **"Eliminar"** y hace click respectivamente. Tras refrescar la vista, verifica que la funcion del servicio se ejecutó y valida que el elemento de la tarea ya no existe dentro del arbol **HTML** de la lista.

- ## npm test:

Al ejecutar el npm test en el **backend**, este demostro que las dos suites se ejecutaron correctamente incluso con las nuevas tareas agregadas para un total de diez.

Si nos enfocamos en ``tareas.service.spec.ts``:

```sql
actualizar:
-- query se hace llamar con el UPDATE, con el titulo y el id como parámetros (['Título nuevo', 1]), esto hace que el metodo al final nos devuelva una fila actualizada.

eliminar:
-- query se hace llamar con el DELETE y el id como parametro ([1]), y aqui sucede similar que con la prueba de actualizar, donde el metodo retorna la fila eliminada.
```

Si nos enfocamos en ``tareas.integration.spec.ts``:

```sql
PATCH:
-- Envia {titulo} en el cuerpo, responde 200 con la tarea actualizada y query se encarga de recibir el UPDATE con ['Editada', 1].

DELETE:
-- Responde 200 con la tarea eliminada y query aqui recibe el DELETE con [1].

PATCH: (Sin tarea)
-- Con query va a devolver rows: [], osea, filas vacias y posteriormente responde 404.

DELETE: (Sin tarea)
-- Con query va a devolver rows: [], nuevamente, retorna filas vacias para luego responder 404.
```

Al ejecutar npm test en el **frontend**, la terminal confirmo que todo estuviera en orden al mostrar cuatro de cuatro procesos ejecutados sin ningun inconveniente ``(Executed 4 of 4 SUCCESS)`` para posteriormente visualizar el apartado de Karma con sus cuatro specs evaluados.

Adicionalmente, las pruebas del servicio HTTP mediante el Karma una vez inicializado el **frontend** permite confirmar que los botones agregados a la interfaz funcionan como deberian en donde al agregar una tarea nueva se actualiza la lista, si deseamos eliminarla el id de esta tarea se llama mediante el **spy** y la lista se actualiza nuevamente. Finalmente, para editar una tarea existente el boton de guardar cambios trae el id una vez mas gracias al **spy** con el titulo nuevo y la interfaz actualizada con los cambios que hemos realizado.

# Comandos Git:

Los comandos git utilizados para la realizacion de los commits en actualizaciones anteriores se realizaron mediante el Github Desktop para mayor comodidad asi como el ``pull origin master`` para traer los cambios de Master a la rama ``GBR`` en donde se trabajo todo el Taller antes de migrar a ``taller/actualizar-eliminar-tareas/gabrielbr-josemanuel``, traducidos a comandos en terminal se verian tal que asi:

```
git checkout -b taller/actualizar-eliminar-tareas/gabrielbr-josemanuel

git status

git add ENTREGA.md evidencias-trabajo

git commit -m "Entrega y evidencias de trabajo"

git push origin "Nombre-rama"
```

El ``git status`` se realizo para verificar que el .env no se involucrara e igualmente que sea ignorado por el **.gitignore** de la raiz.

Link de la rama: https://github.com/TevenV27/campus-task/tree/taller/actualizar-eliminar-tareas/gabrielbr-josemanuel

