# Plataforma de Subastas Online

Plataforma de subastas online desarrollada con Angular 19 y NestJS, ofreciendo una experiencia de subasta interactiva y en tiempo real.

## Stack Tecnológico

- **Frontend:** Angular 19 con SSR/SSG (en client-ng/bid-master-front)
- **Backend:** NestJS con PostgreSQL
- **Autenticación:** Auth0/Firebase
- **Comunicación en tiempo real:** Server-Sent Events (SSE)
- **Estilo:** Tailwind CSS / Material UI

## Características Principales

- Subastas en tiempo real
- Interfaz de usuario moderna y responsive
- Sistema de autenticación seguro
- Base de datos PostgreSQL para persistencia de datos
- Comunicación en tiempo real mediante SSE

## Estructura del Proyecto

```
.
├── client-ng/           # Cliente Angular
│   └── bid-master-front # Aplicación principal
├── server/             # Backend API
└── shared/             # Código compartido
```

## Scripts Disponibles

### Backend (Puerto 3000)
- `npm run dev`: Inicia el servidor de desarrollo API
- `npm run build`: Construye la aplicación para producción
- `npm run start`: Inicia la aplicación en modo producción
- `npm run check`: Ejecuta la verificación de tipos TypeScript
- `npm run db:push`: Actualiza el esquema de la base de datos

### Frontend (Puerto 4200)
Para iniciar el frontend, navega a la carpeta del proyecto Angular:
```bash
cd client-ng/bid-master-front
ng serve
```

## Estado del Proyecto

En desarrollo activo - Marzo 2025.