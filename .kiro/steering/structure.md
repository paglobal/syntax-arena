# Project Structure

## Root Directory

- `src/` - Main source code
- `public/assets/` - Static assets (SVG sprites for characters, icons, objects)
- `dist/` - Build output directory
- `node_modules/` - Dependencies
- Configuration files: `package.json`, `tsconfig.json`, `vite.config.ts`

## Source Code Organization (`src/`)

### Core Application

- `index.tsx` - Application entry point, asset loading, and general initialization
- `App.tsx` - Main application component with tab-based navigation
- `customElements.ts` - Web Awesome component imports
- `utils.ts` - Shared utilities, e.g., RNG, asset management, and type definitions
- `index.css` - Global styles

### Feature Modules

Each major feature is organized in its own directory with clear separation:

#### `arena/` - Game Environment

- `Arena.tsx` - Component for game UI and overlay
- `index.ts` - Arena initialization, state management and actions
- `constants.ts` - Arena constants and configuration
- `player.ts`, `enemies.ts`, `powerUps.ts`, `keys.ts` - Game entity logic
- `maze.ts` - Level generation and navigation

#### `command-forge/` - Syntax Tree Editor

- `CommandForge.tsx` - Main editor interface
- `SyntaxShard.tsx` - Individual syntax node component
- `NamedBadge.tsx`, `NamedContainer.tsx` - UI building blocks
- `index.ts` - State management and actions
- `interpreter.ts` - Code parsing and execution logic

#### Other Modules (Placeholder Structure)

- `combat-archive/` - Leaderboard
- `tactical-telemetry/` - Analytics
- `control-schema/` - Controls documentation
- `orchestrator/` - Global coordination

## Asset Organization (`public/assets/`)

- `characters/` - Player and enemy SVG sprites
- `icons/` - UI icons (extensive Bootstrap Icons collection)
- `objects/` - Game object sprites (power-ups, keys, etc.)

## Architectural Patterns

- **Feature-based organization**: Each major feature in its own directory
- **Component co-location**: Related components grouped together
- **State management**: Promethium-js reactive state per module
- **Asset bundling**: PIXI.js asset bundles by category (characters, objects)

## Import Conventions

- Prefer `@/` alias for imports, e.g., `import { something } from "@/utils"`, unless normal imports have shorter paths, e.g., `import { Arena } from "./arena"`, then prefer those
- Web Awesome components imported in `customElements.ts`
