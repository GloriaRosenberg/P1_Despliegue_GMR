# Reglas de arquitectura y estilo para la API REST de Contactos

## 1. Descripción del proyecto

Este proyecto es una API REST sencilla construida con Node.js, Express y Mongoose para gestionar una base de datos de eventos.

## 2. Estructura de carpetas obligatoria

Todo el código fuente debe estar estructurado estrictamente de la siguiente manera:

- `models/` (Esquemas y modelos de Mongoose)
- `routes/` (Enrutadores de Express)
- `index.js` (Punto de entrada de la aplicación)

## 3. Modelos de datos

Los modelos de datos necesarios ya están definidos dentro de la carpeta `models/`.

## 4. Estilo de código y convenciones

- **Módulos**: Utilizar siempre la sintaxis moderna de **ES Modules** (`import` / `export`), no `require()`.
- **Control de Errores**: Usar bloques `try / catch` y `async/await` en las funciones controladoras. Responder con códigos de estado HTTP adecuados (200, 201, 400, 404, 500) y mensajes en JSON con la estructura `{ message: "..." }`.
- **Rutas**: Definir los enrutadores en `routes/eventos.js` y `routes/recintos.js` (ya creados), con los endpoints indicados a continuación. Cada enrutador englobará la lógica de acceso a la base de datos y recuperación/generación de la información correspondiente.

Ejemplo de estructura y estilo para un endpoint GET /recintos de los recintos:

```javascript
router.get("/", async (req, res) => {
  try {
    const resultado = await Recinto.find();
    if (resultado.length > 0) {
      res.status(200).send({ ok: true, resultado: resultado });
    } else {
      throw new Error();
    }
  } catch (error) {
    res.status(500).send({ ok: false, error: "No se han encontrado recintos" });
  }
});
```

## 5. Endpoints requeridos

Todos los endpoints incluirán en su respuesta un booleano llamado `ok` , que será `true` si la petición ha podido atenderse, o `false` si se ha producido algún error de tipo 400 o 500.

### 5.1 Endpoints de recintos en `recintos.js`

- `GET /recintos`: Obtiene un listado de todos los recintos almacenados. Devolverá un código de estado `200` con un campo `resultado` que contenga el listado de recintos si hay al menos uno. Si no hay ningún recinto, o falla la consulta, devolverá un código `500` con un campo `error` que contenga el mensaje "No se han encontrado recintos".

- `GET /recintos/:id`: Obtiene el recinto con el id indicado. Devolverá un código `200` y un campo `resultado` con el recinto encontrado, si es satisfactorio. Si no se encuentra el recinto indicado (por resultado nulo, o por error general), se devolverá un código `404` y un campo `error` con el mensaje "Recinto X no encontrado", siendo X el id facilitado en la URL.

- `GET /recintos/localidad/:nombre`: Obtiene los recintos que se encuentren en la localidad indicada. Devolverá un código de estado `200` con un campo `resultado` que contenga el listado de recintos si hay al menos uno. Si no hay ningún recinto, o falla la consulta, devolverá un código `404` con un campo `error` que contenga el mensaje "No se han encontrado recintos de la localidad indicada".

- `POST /recintos`: Añade un nuevo recinto a la colección, cuyos datos recibirá por JSON en el cuerpo de la petición. Devolverá un código `201` (creado), junto con el objeto creado en un campo `resultado`, si todo ha ido correctamente, o un código `500` con un campo `error` con el mensaje "Error añadiendo recinto" si ha habido algún error.

- `DELETE /recintos/:id`: Elimina el recinto con el id indicado. Devolverá un código `200` y un campo `resultado` con el recinto eliminado, si es satisfactorio. Si no se encuentra el recinto indicado (resultado nulo o error en la operación), se devolverá un código `404` y un campo `error` con el mensaje "Error eliminando recinto X", siendo X el id facilitado en la URL.

### 5.2 Endpoints de eventos y entradas en `eventos.js`

- `GET /eventos`: Obtiene un listado de todos los eventos almacenados. Devolverá un código de estado `200` con un campo `resultado` que contenga el listado de eventos si hay al menos uno, con toda la información de recinto y entradas (usa `populate` cuando sea necesario). Si no hay ningún evento, o falla la consulta, devolverá un código `500` con un campo `error` que contenga el mensaje "No se han encontrado eventos".

- `GET /eventos/:id`: Obtiene el evento con el id indicado. Devolverá un código `200` y un campo `resultado` con el evento encontrado, si es satisfactorio. Si no se encuentra el evento indicado (resultado nulo o error en la consulta), se devolverá un código `404` y un campo `error` con el mensaje "Evento X no encontrado", siendo X el id facilitado en la URL.

- `GET /eventos/localidad/:nombre`: Obtiene los eventos que se encuentren en la localidad indicada y cuya fecha aún no haya pasado. Devolverá un código de estado `200` con un campo `resultado` que contenga el listado de eventos si hay al menos uno. Si no hay ningún evento, o falla la consulta, devolverá un código `404` con un campo `error` que contenga el mensaje "No se han encontrado eventos".

- `POST /eventos`: Añade un nuevo evento a la colección, cuyos datos recibirá por JSON en el cuerpo de la petición. Devolverá un código `201` (creado), junto con el objeto creado en un campo `resultado`, si todo ha ido correctamente, o un código `500` con un campo `error` con el mensaje "Error añadiendo evento" si ha habido algún error.

- `PUT /eventos/:id`: Actualiza los datos del evento con el id indicado. Devolverá un código `200` y un campo `resultado` con el evento actualizado, si es satisfactorio. Si no se encuentra el evento indicado (resultado nulo o error en la operación), se devolverá un código `404` con un campo `error` con el mensaje "Error actualizando evento X", siendo X el id facilitado en la URL.

- `DELETE /eventos/:id`: Elimina el evento con el id indicado. Devolverá un código `200` y un campo `resultado` con el evento eliminado, si es satisfactorio. Si no se encuentra el evento indicado (resultado nulo o error en la operación), se devolverá un código `404` y un campo `error` con el mensaje "Error eliminando evento X", siendo X el id facilitado en la URL.

**Endpoints específicos para entradas:**

- `GET /eventos/entradas/:idEvento/:tipoEntrada`: Obtiene el precio y el número de entradas disponibles del evento indicado, para el tipo de entrada indicada. Si se encuentra la información, se enviará un código `200` junto con un campo `resultado` que internamente tendrá dos subcampos (`precio` y `disponibles`). Si no se encuentra o se produce algún error en la consulta, se devolverá un código `404` con el campo `error` con el mensaje "Error obteniendo datos de entrada para evento X", siendo X el id de evento facilitado.

- `PUT /eventos/entradas/:idEvento/:tipoEntrada/:cantidad`: Resta la cantidad de entradas de las disponibles para el evento y tipo de entrada indicados. Por ejemplo, para `idEvento=3`, `tipoEntrada=VIP` y `cantidad=5` restaría 5 entradas disponibles de tipo VIP en el evento 3. Devolverá un código `200` si se ha podido realizar correctamente, y un campo `resultado` con el evento y sus entradas actualizadas. Si falla la operación, o no hay tantas entradas disponibles para restar, se devolverá un código `404` con un campo `error` que diga "Error actualizando entradas del evento X", siendo X el id del evento facilitado.
