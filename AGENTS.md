# AGENTS.md - Development Guidelines

## Build/Test/Lint Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production app with Turbopack  
- `npm run start` - Start production server
- `npm run lint` - Run Biome linter/checker
- `npm run format` - Format code with Biome
- No test framework configured - add tests if needed

## Code Style Guidelines
- **Formatter**: Biome with 2-space indentation
- **Imports**: Use `@/` alias for src imports, organize imports automatically
- **Types**: Strict TypeScript enabled, use proper Next.js types (`NextConfig`, `AppProps`)
- **Components**: Use default exports for pages, named exports for utilities
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Error Handling**: Use Next.js error boundaries and API error responses
- **Styling**: Tailwind CSS with utility classes, support for dark mode

## Project Structure
- Pages Router architecture (`src/pages/`)
- API routes in `src/pages/api/`
- Global styles in `src/styles/`
- TypeScript with strict mode and path aliases