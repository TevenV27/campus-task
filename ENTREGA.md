# ENTREGA - CampusTasks

## 1. Datos

 *Integrantes:* 
- Aura Maria Pelaez Luna - 202459422
- Miguel Angel Uribe Perez - 202459430
- Valentina Valencia Lopez -202459626

 *Fecha:* 2 de octubre de 2026
 
 *Rama:* taller/valentina-uribe-aura

---

## 2. Puesta en marcha

### 2.1 Node.js y npm

Instalamos Node.js 24.x y comprobamos las versiones con node -v (v24.21.0) y npm -v (11.19.0). En Windows, npm estaba bloqueado por la política de ejecución de scripts de PowerShell, así que ejecutamos Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned y después npm -v funcionó.


### 2.2 PostgreSQL

Instalamos PostgreSQL 16 con el instalador de Windows. Como psql no se reconocía, agregamos la carpeta C:\Program Files\PostgreSQL\16\bin al PATH. Como no recordábamos la contraseña del usuario postgres, la restablecimos y definimos una nueva. Después comprobamos la conexión con psql -U postgres -h 127.0.0.1 -p 5432 -d postgres, que mostró el prompt postgres=#.


### 2.3 Base de datos, tabla y datos iniciales

Dentro de psql creamos la base campus_tasks, nos conectamos a ella con \c campus_tasks, creamos la tabla tareas (id SERIAL PRIMARY KEY, titulo TEXT NOT NULL) e insertamos las dos tareas iniciales. Con SELECT * FROM tareas; comprobamos que quedaron las dos filas.



### 2.4 Configuración del backend

Revisamos backend/src/database/database.service.ts. DatabaseService crea un Pool de la librería pg y toma sus datos de conexión de cinco variables de entorno: DB_HOST, DB_PORT (con valor por defecto 5432 si no se define), DB_USER, DB_PASSWORD y DB_NAME. También expone el método query(sql, params), que usan los métodos del servicio para ejecutar consultas parametrizadas.


### 2.5 Archivo .env

Creamos el archivo backend/.env, dentro de la carpeta backend, porque main.ts carga dotenv/config al arrancar y dotenv busca el archivo en la carpeta desde donde se ejecuta el servidor. Contiene las variables DB_HOST=127.0.0.1, DB_PORT=5432, DB_USER=postgres, DB_PASSWORD (oculta en la captura por seguridad) y DB_NAME=campus_tasks. El archivo no se sube a Git porque está ignorado por el .gitignore de la raíz del repositorio.


### 2.6 Comprobación del backend

Iniciamos el backend desde la carpeta backend con npm run start:dev. La terminal muestra que Nest inicializó AppModule, DatabaseModule y TareasModule, y mapeó las rutas GET /tareas y POST /tareas. El mensaje final Nest application successfully started confirma que la aplicación arrancó.


Con el backend corriendo abrimos http://localhost:3000/tareas en el navegador. La respuesta es un JSON con las dos tareas iniciales, lo que confirma que el backend se conecta a la base de datos.


### 2.7 Comprobación del frontend

Iniciamos el frontend desde la carpeta frontend con npm start y abrimos http://localhost:4200. Aparecen las dos tareas iniciales. Escribimos un título, pulsamos *Agregar* y la tarea nueva apareció en la lista.

### 2.8 Pruebas existentes

Desde backend ejecutamos npm test: pasaron las dos suites, tareas.service.spec.ts y tareas.integration.spec.ts. Desde frontend ejecutamos npm test: Karma abrió Chrome y pasaron las pruebas de tareas.component.spec.ts.


---

## 3. Lectura de los ejemplos

Revisamos los tres archivos de prueba del repositorio. En tareas.service.spec.ts las pruebas unitarias llaman directamente a listar y crear; DatabaseService se reemplaza por un objeto simulado cuyo query es un jest.fn(), así que no se necesita base de datos. Se verifica el valor devuelto y los argumentos exactos con los que se llamó a query. En tareas.integration.spec.ts se monta un TestingModule con el controlador y el servicio, y con supertest se hacen peticiones HTTP reales a GET /tareas y POST /tareas; se comprueba el código de estado, el cuerpo y los argumentos de query. En tareas.component.spec.ts se monta TareasComponent con Jasmine y Karma, el servicio HTTP se reemplaza por un spy, se simulan clics y se verifica que el spy se llamó con lo esperado y que la pantalla muestra el resultado.

El patrón que reutilizamos en todas las pruebas nuevas es *preparar* (definir qué devuelve el query o el spy), *ejecutar* (llamar al método, hacer la petición o simular el clic) y *verificar* (comprobar el resultado y los argumentos).

---

## 4. Implementación

### 4.1 Backend

*Servicio.* Agregamos en TareasService los métodos actualizar(id, titulo) y eliminar(id):

- actualizar ejecuta UPDATE tareas SET titulo = $1 WHERE id = $2 RETURNING id, titulo.
- eliminar ejecuta DELETE FROM tareas WHERE id = $1 RETURNING id, titulo.

Ambas consultas son parametrizadas con $1 y $2, igual que crear. No se concatenan valores dentro del texto SQL, para evitar la inyección SQL.



*Controlador.* Agregamos en TareasController las rutas PATCH /tareas/:id y DELETE /tareas/:id.

- *Conversión del id:* el :id llega como texto en la URL. Usamos ParseIntPipe en @Param('id', ParseIntPipe), que lo convierte a number antes de llamar al servicio y responde 400 automáticamente si no es un número válido. Elegimos esta opción porque es la forma que ofrece Nest para esta conversión y evita escribir la validación a mano.
- *Detección del 404:* como las consultas usan RETURNING, si el id no existe la consulta devuelve rows vacío y el servicio devuelve undefined. El controlador revisa ese valor y, si no hay tarea, lanza NotFoundException, que Nest responde como 404 Not Found. Elegimos esta opción porque no necesita una consulta adicional para saber si la tarea existe.
- *Código de estado 200:* Nest responde 200 por defecto en PATCH y DELETE, que es el código que pide el contrato, por lo que no hizo falta configurarlo.


### 4.2 Frontend

*Servicio HTTP.* En tareas.service.ts agregamos dos métodos:

- actualizar(id, titulo): envía PATCH /tareas/:id con el cuerpo { titulo }.
- eliminar(id): envía DELETE /tareas/:id.

Ambos devuelven un Observable<Tarea>, igual que crear.


*Componente.* En TareasComponent agregamos las señales editandoId (id de la tarea que se está editando) y mensajeError, y los métodos editar, guardar y eliminar. Cada tarea muestra los botones *Editar* y *Eliminar. Al pulsar **Editar, el título se convierte en un campo de texto con el valor actual y aparece el botón **Guardar. Al pulsar **Guardar, se llama al servicio con el id y el título nuevo, y la tarea muestra el título que devolvió el backend; las demás tareas no cambian. Al pulsar **Eliminar*, se llama al servicio con el id de esa tarea y esta desaparece de la lista mientras las demás siguen visibles.

La lista en pantalla solo cambia dentro de la respuesta exitosa del servicio (en next de la suscripción), nunca antes de llamarlo.

*Qué pasa en pantalla ante un error.* Si el backend responde con error, por ejemplo 404 porque la tarea ya no existe, la lista *no cambia* y se muestra un mensaje de error (por ejemplo, "No se pudo eliminar la tarea. Es posible que ya no exista."). Decidimos no modificar la lista en ese caso para no mostrar un estado distinto del que realmente hay en la base de datos.


---

## 5. Pruebas

### 5.1 Pruebas del backend

En tareas.service.spec.ts agregamos dos pruebas unitarias con el mismo patrón de las existentes:

| Prueba | Qué cubre |
|---|---|
| actualiza el título y devuelve la fila actualizada | query se llamó con el UPDATE, el título y el id; el método devuelve la fila actualizada. |
| elimina la tarea y devuelve la fila eliminada | query se llamó con el DELETE y el id; el método devuelve la fila eliminada. |

En tareas.integration.spec.ts agregamos cuatro pruebas de integración con supertest:

| Prueba | Qué cubre |
|---|---|
| PATCH /tareas/:id actualiza el título y responde 200 | Envía el título, responde 200 con la tarea actualizada y se verifican los argumentos de query. |
| PATCH /tareas/:id responde 404 si la tarea no existe | Con query devolviendo rows vacío, responde 404. |
| DELETE /tareas/:id elimina la tarea y responde 200 | Responde 200 con la tarea eliminada y se verifican los argumentos de query. |
| DELETE /tareas/:id responde 404 si la tarea no existe | Con query devolviendo rows vacío, responde 404. |

Resultado de npm test en backend: pasan las 2 suites y las 10 pruebas (las nuevas y las que ya existían).


### 5.2 Prueba manual del backend con la base real

Con el backend conectado a PostgreSQL probamos las rutas nuevas desde PowerShell. Consultamos GET /tareas y obtuvimos las dos tareas iniciales. Creamos una tarea de prueba con POST /tareas, la editamos con PATCH /tareas/:id enviando { "titulo": "Titulo editado" } y el backend devolvió la tarea con el título nuevo; GET /tareas confirmó el cambio. Luego la eliminamos con DELETE /tareas/:id, el backend devolvió la tarea eliminada y GET /tareas mostró que la lista volvió a las dos tareas iniciales.


También probamos el caso de error con un id que no existe. PATCH /tareas/999 y DELETE /tareas/999 respondieron 404 Not Found con el cuerpo {"message":"La tarea 999 no existe","error":"Not Found","statusCode":404}.

> Nota: la primera vez que probamos el PATCH a un id inexistente el servidor respondió 400, pero fue por un error de comillas en el comando de PowerShell (el JSON llegó dañado), no del backend. Al corregir el comando respondió 404.


### 5.3 Pruebas del frontend

En tareas.component.spec.ts agregamos actualizar y eliminar al spy del servicio y tres pruebas con el mismo patrón de las existentes. El servicio HTTP está reemplazado por un spy, así que no se necesita el backend encendido.

| Prueba | Qué cubre |
|---|---|
| edita una tarea: Editar, escribir el título y Guardar | Tras pulsar *Editar, escribir un título y pulsar **Guardar*, el spy se llamó con el id y el título nuevo, y la pantalla muestra el título actualizado sin modificar la otra tarea. |
| elimina una tarea al hacer clic en Eliminar | Tras pulsar *Eliminar*, el spy se llamó con el id de esa tarea; la tarea desaparece y la otra sigue visible. |
| no cambia la lista y muestra un error si el backend falla al eliminar | Si el servicio falla, la lista no cambia y aparece el mensaje de error. |

Las pruebas de listar y agregar siguen pasando sin cambios en lo que verifican. Resultado de npm test en frontend: Executed 5 of 5 SUCCESS.


### 5.4 Prueba manual completa en el navegador

Con PostgreSQL, el backend y el frontend corriendo, abrimos http://localhost:4200. Cada tarea muestra los botones *Editar* y *Eliminar. Agregamos una tarea de prueba, pulsamos **Editar, cambiamos el título y pulsamos **Guardar: la tarea mostró el título nuevo. Al consultar http://localhost:3000/tareas el cambio estaba en la base de datos. Después pulsamos **Eliminar* y la tarea desapareció de la lista; GET /tareas confirmó que ya no existía.


---

## 6. Git

Comandos usados:


git checkout master
git pull
git checkout -b taller/valentina-uribe-aura
git status
git add backend/src
git commit -m "Agrega actualizar y eliminar tareas en el backend con pruebas unitarias y de integración"
git add frontend/src
git commit -m "Agrega editar y eliminar tareas en el frontend con pruebas de componente"
git add ENTREGA.md evidencias
git commit -m "Agrega documento de entrega con evidencias"
git push -u origin taller/valentina-uribe-aura


Antes de cada commit ejecutamos git status para confirmar que el archivo .env no aparecía en la lista. El .env está ignorado por el .gitignore de la raíz y no se forzó con git add -f. No se hicieron commits en master.

Historial de la rama:


3629b26 Agrega editar y eliminar tareas en el frontend con pruebas de componente
b4e6612 Agrega actualizar y eliminar tareas en el backend con pruebas unitarias y de integración
84cd62d (master) Merge branch 'tests'


*URL de la rama:* https://github.com/TevenV27/campus-task/tree/taller/valentina-uribe-aura
