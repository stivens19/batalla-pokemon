# Batalla Pokémon

Aplicación web desarrollada en React + TypeScript + Vite para simular un torneo automático de Pokémon en modo 3v3. El proyecto consume la PokeAPI para generar equipos aleatorios y muestra una experiencia visual tipo auto battler con logs de combate, golpes críticos y selección de personajes.

## Características

- Generación aleatoria de equipos de 3 Pokémon por lado.
- Simulación de combate automático entre dos equipos.
- Sistema de daño con golpes críticos y mensajes de batalla en tiempo real.
- Cambio de personajes durante la batalla para estrategias de reemplazo.
- Interfaz visual con Tailwind CSS y componentes organizados por Atomic Design.
- Consumo de datos desde la PokeAPI.

## Tecnologías utilizadas

- React 19
- TypeScript
- Vite
- Tailwind CSS
- PokeAPI
- UUID
- ESLint

## Requisitos previos

- Node.js 18 o superior
- npm o pnpm

## Instalación

1. Clona este repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd batalla-pokemon
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo .env en la raíz del proyecto con la URL base de la API:
   ```env
   VITE_API_URL=https://pokeapi.co/api/v2
   ```

## Ejecución

Inicia el servidor de desarrollo:

```bash
npm run dev
```

La aplicación quedará disponible en la URL que indique Vite, normalmente en http://localhost:5173.

## Construcción para producción

```bash
npm run build
```

## Estructura del proyecto

```text
src/
  application/     Hooks y lógica de aplicación
  core/            Modelos, constantes y motor de batalla
  infrastructure/   Consumo de API y adaptadores
  ui/              Componentes de interfaz (atoms, molecules, organisms, pages)
```

## Scripts disponibles

- npm run dev: inicia el entorno de desarrollo
- npm run build: compila la aplicación para producción
- npm run lint: ejecuta ESLint sobre el proyecto
- npm run preview: previsualiza la build generada

## Nota

Este proyecto está pensado como una demo interactiva de lógica de combate y arquitectura frontend en React, con enfoque en componentes reutilizables y separación de responsabilidades.
