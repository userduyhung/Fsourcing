# Technology Stack & Framework Analysis

## Frontend Framework
- **React 18.3.1** with TypeScript 5.5.3
- **Vite 5.4.2** as build tool and dev server
- Modern ES modules with bundler module resolution

## Styling & UI
- **Tailwind CSS 3.4.1** for utility-first CSS
- **PostCSS 8.4.35** for CSS processing  
- **Autoprefixer 10.4.18** for browser compatibility
- **Lucide React 0.344.0** for icons (only icon library used)
- Custom fonts: Poppins (headings) + Inter (body text)

## Development Tools
- **ESLint 9.9.1** with TypeScript ESLint configuration
- **@vitejs/plugin-react 4.3.1** for React support
- Strict TypeScript configuration with modern targets

## Backend/Data Layer
- **Supabase 2.57.4** included in dependencies (not actively used in current code)
- No active database integration or API calls yet

## Build Configuration
- ES2020 target with DOM libraries
- JSX in React mode
- Strict TypeScript settings with unused parameter/variable checks
- Module detection forced for better tree-shaking

## Notable Exclusions
- No routing library (react-router) - single page application
- No state management (Redux, Zustand) - static content
- No authentication system implemented
- No form handling libraries
- No testing framework configured