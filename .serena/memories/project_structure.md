# Project Structure & Architecture

## Directory Structure
```
project/
├── .bolt/                    # Bolt.new configuration
│   ├── config.json
│   └── prompt               # Development guidelines
├── src/
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # React app entry point  
│   ├── index.css           # Global styles with Tailwind
│   └── vite-env.d.ts       # Vite TypeScript declarations
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript project references
├── tsconfig.app.json      # App-specific TypeScript config
├── tsconfig.node.json     # Build tool TypeScript config
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── eslint.config.js       # ESLint configuration
└── .gitignore            # Git ignore rules
```

## Application Architecture
### Single Page Application (SPA)
- **No routing**: Static content in single App.tsx component
- **Component-based**: Modular React functional components
- **Section-based layout**: Header → Hero → Features → Content → Footer

### Data Flow
- **Static data**: Hardcoded supplier/product information
- **No state management**: Pure presentational components
- **No API integration**: Ready for Supabase but not implemented

### Styling Architecture
- **Utility-first**: Tailwind CSS with custom design tokens
- **Responsive design**: Mobile-first approach
- **Design system**: Consistent colors, spacing, typography
- **Component variants**: Hover states, transitions, shadows

## Component Structure Patterns
### Main App Component (`App.tsx`)
- **Section components**: Each major area is self-contained
- **Inline data arrays**: Supplier/feature data embedded in JSX
- **Icon integration**: Lucide React icons throughout
- **Responsive grids**: Flexbox and CSS Grid patterns

### Styling Patterns
- **Card layouts**: Consistent shadow, hover, transition patterns
- **Button variants**: Primary, secondary, outline styles
- **Color scheme**: Blue/cyan theme with gray neutrals
- **Typography scale**: Heading hierarchy with custom fonts

## Development Patterns
- **TypeScript-first**: Strict typing throughout
- **Modern React**: Hooks, functional components, JSX transform
- **Build optimization**: Vite for fast development and building
- **Code quality**: ESLint + TypeScript for error prevention