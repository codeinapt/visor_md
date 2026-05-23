# VisorMD Full Stack (Dockerized)

Este proyecto es una evolución del visor de documentación original, ahora implementado con una arquitectura moderna Full Stack utilizando React, Node.js, PostgreSQL y orquestación con Docker.

## Componentes Implementados
1.  **Frontend**: React + Vite.
    - Implementación de `Hooks` (`useState`, `useEffect`, `useReducer`).
    - Gestión de estado global con `Context API`.
    - Navegación mediante `React Router`.
2.  **Backend**: Node.js + Express.
    - API REST con conexión a PostgreSQL.
    - Documentación interactiva con **Swagger**.
3.  **Base de Datos**: PostgreSQL 15 con persistencia de datos.
4.  **Infraestructura**: Orquestación de contenedores con `docker-compose`.

## Instrucciones para Ejecutar el Proyecto
Para levantar todo el sistema, asegúrate de tener Docker instalado y ejecuta el siguiente comando en la raíz del proyecto:

```bash
docker-compose up --build
```

### URLs de Acceso
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **API (REST)**: [http://localhost:3001](http://localhost:3001)
- **Documentación Swagger**: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

## Documentación del Proyecto
-   **Análisis Técnico**: [Propuesta_Proyecto.md](./Propuesta_Proyecto.md)
-   **Conceptos Web (APA 7)**: [Conceptos_Desarrollo_Web.md](./Conceptos_Desarrollo_Web.md)

## Requisitos de la Actividad
El código demuestra la aplicación de:
- **REST con Swagger** en el backend.
- **ReactJS** en el frontend.
- **Hooks** (`useState`, `useContext`, `useEffect`, `useReducer`).
- **Context API** para el tema y estado de documentos.
- **Axios** para el consumo de la API.
- **Rutas y navegación**.
- **Despliegue** mediante Docker.

## Cómo subir a GitHub
1.  Crea un nuevo repositorio en GitHub.
2.  En la terminal de este proyecto:
    ```bash
    git init
    git add .
    git commit -m "Initial commit: Full Stack VisorMD with React, Express, Postgres and Docker"
    git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
    git push -u origin main
    ```
