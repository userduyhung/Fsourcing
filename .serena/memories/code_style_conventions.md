# Code Style & Conventions

## TypeScript Configuration
- **Strict mode enabled** with comprehensive type checking
- **ES2020 target** with modern JavaScript features
- **React JSX transform** (automatic runtime)
- **Unused locals/parameters** flagged as errors
- **No fallthrough cases** in switch statements enforced

## ESLint Rules
- Extends recommended JavaScript and TypeScript configurations
- **React Hooks rules** enforced for proper hook usage
- **React Refresh** warnings for HMR compatibility
- **Browser globals** configured for web environment
- Ignores `dist` directory from linting

## File Naming Conventions
- **PascalCase** for React components (`App.tsx`)
- **camelCase** for utility files (`main.tsx`)
- **kebab-case** for config files (`eslint.config.js`, `vite.config.ts`)
- **lowercase** for standard files (`index.html`, `package.json`)

## Code Structure Patterns
- Single component per file approach
- Functional React components using arrow functions
- **Component structure**: imports → component definition → export default
- **Props**: TypeScript interfaces for type safety (when needed)

## Styling Conventions
- **Utility-first approach** with Tailwind CSS
- **Responsive design** using Tailwind breakpoints (sm:, md:, lg:)
- **Design system colors**: blue-600, tech-blue, cyan custom colors
- **Semantic spacing**: consistent padding/margin patterns
- **Custom fonts**: Poppins for headings, Inter for body text

## Component Organization
- **Layout sections**: header, hero, features, content, footer pattern
- **Reusable patterns**: grid layouts, card components, button styles
- **Icon usage**: Lucide React icons with consistent sizing
- **Image handling**: External Pexels URLs for placeholder content

## CSS Architecture
- **@layer base** for foundational styles in index.css
- **Font-family** definitions at base layer
- **Tailwind directives** properly imported
- **No custom CSS classes** - pure utility approach