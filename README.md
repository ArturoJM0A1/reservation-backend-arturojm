# Reservation Backend

API REST para la gestion de reservas del proyecto del grupo `com.dev.arturojm`.

Este backend permite:

- registrar nuevas reservas
- consultar las reservas almacenadas
- cancelar una reserva existente

## Stack tecnologico

- Java 25
- Spring Boot 4.0.4
- Spring Web MVC
- Spring Data JPA
- PostgreSQL
- Maven
- H2 para pruebas automatizadas

## Requisitos previos

Antes de ejecutar el proyecto, asegurate de tener:

- Java 25 instalado
- PostgreSQL en ejecucion
- una base de datos creada con el nombre `g3reservation`

## Configuracion

La aplicacion puede ejecutarse con estas variables de entorno:

```properties
DB_URL=jdbc:postgresql://localhost:5432/g3reservation
DB_USERNAME=postgres
DB_PASSWORD=arturo1
```

Si no defines estas variables, el proyecto usa esos valores por defecto.

El servidor corre en el puerto:

```properties
server.port=8081
```

## Como ejecutar el proyecto

Desde la raiz del proyecto, en Windows:

```bash
mvnw.cmd spring-boot:run
```

Si tienes Maven instalado de forma global, tambien puedes usar:

```bash
mvn spring-boot:run
```

Una vez iniciado, la API queda disponible en:

```text
http://localhost:8081
```

## Como ejecutar las pruebas

```bash
mvnw.cmd test
```

Las pruebas usan H2 en memoria, por lo que no dependen de tu base de datos PostgreSQL local.

## Endpoints disponibles

### GET /reservas

Obtiene todas las reservas registradas.

Respuestas posibles:

- `200 OK` si existen reservas
- `404 Not Found` si la base de datos esta vacia

Ejemplo de error:

```json
{
  "message": "No hay reservas registradas en la base de datos."
}
```

### POST /reservas

Crea una nueva reserva.

Consideraciones:

- el `id` se genera automaticamente
- el estado final se establece en `PENDING`, aunque el cliente envie otro valor

Ejemplo de cuerpo:

```json
{
  "customerName": "Ana Perez",
  "date": "2026-03-25",
  "time": "14:30:00",
  "service": "Corte de cabello",
  "status": "CONFIRMED"
}
```

Respuesta:

- `201 Created` si la reserva se registra correctamente

### DELETE /reservas/{id}

Cancela una reserva existente a partir de su identificador.

Consideraciones:

- no elimina fisicamente el registro
- cambia el estado de la reserva a `CANCELLED`

Respuestas posibles:

- `204 No Content` si la reserva fue cancelada
- `404 Not Found` si no existe una reserva con el `id` indicado

Ejemplo de error:

```json
{
  "message": "No existe una reserva con id 999."
}
```

## Modelo principal

La entidad `Reservation` contiene los siguientes campos:

- `id`
- `customerName`
- `date`
- `time`
- `service`
- `status`

Estados disponibles:

- `PENDING`
- `CONFIRMED`
- `CANCELLED`

## Estructura del proyecto

```text
src/main/java/com/dev/arturojm/reservation
|-- controller
|-- entity
|-- exception
|-- repository
`-- service
```

## Notas

- La API expone documentacion Swagger cuando la aplicacion esta en ejecucion.
- La cancelacion de reservas se maneja como una actualizacion de estado, no como borrado fisico.
- El proyecto incluye reglas de negocio para evitar respuestas vacias sin contexto.
