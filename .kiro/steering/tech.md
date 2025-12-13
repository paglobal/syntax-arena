# Technology Stack

## Core Technologies

- **TypeScript**: Primary language with strict type checking enabled
- **Vite**: Build tool and development server
- **Promethium.js**: UI framework JSX-like syntax for functional components with
intuitive signal-based state management
- **Lit**: Web components framework for UI rendering
- **Web Awesome**: Component library providing buttons, icons, tabs, inputs, etc.
- **PIXI.js**: 2D graphics rendering for the Arena game environment
- **Hotkeys.js**: Keyboard input handling

## Utilities & Patterns

- **Custom RNG**: xoshiro128** implementation for deterministic randomness
- **Asset Management**: PIXI.js Assets API for loading SVG sprites

## Common Commands

### Development

```bash
pnpm run dev          # Start development server with hot reload
pnpm run type-check   # Run TypeScript type checking in watch mode
```

### Build & Deploy

```bash
pnpm run build        # Type check and build for production
pnpm run preview      # Preview production build locally
```

## Configuration Notes

- Path aliases: `@/*` maps to `src/*`
- JSX configured to use Promethium.js as import source
- Strict TypeScript settings
