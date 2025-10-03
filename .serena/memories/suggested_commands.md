# Development Commands & Workflows

## Essential npm Scripts
```bash
# Development server (with HMR)
npm run dev

# Production build
npm run build

# Code linting
npm run lint

# Preview production build locally  
npm run preview
```

## Development Workflow Commands

### Initial Setup
```powershell
# Install dependencies
npm install

# Start development server
npm run dev
# Opens on http://localhost:5173 by default
```

### Code Quality Commands
```powershell
# Run ESLint to check code quality
npm run lint

# Fix auto-fixable ESLint issues
npm run lint -- --fix

# TypeScript type checking (via IDE or)
npx tsc --noEmit
```

### Build & Deployment
```powershell
# Create production build
npm run build
# Output in ./dist directory

# Preview production build locally
npm run preview
# Test production build before deployment
```

### Windows-Specific Utilities
```powershell
# Navigate to project directory
cd "C:\Users\Admin\Downloads\project-bolt-sb1-tb6k1tfn\project"

# List files and directories
dir
ls  # if using PowerShell 7+

# Search for files
Get-ChildItem -Recurse -Filter "*.tsx"

# Find text in files
Select-String -Pattern "component" -Path "src\*.tsx"

# Git operations
git status
git add .
git commit -m "commit message"
```

## Development Server Features
- **Hot Module Replacement (HMR)** via Vite
- **TypeScript compilation** on-the-fly
- **ESLint integration** in supported editors
- **Tailwind CSS** hot reload
- **Fast refresh** for React components

## Build Optimization
- **Tree shaking** for unused code elimination
- **Asset optimization** (images, fonts, CSS)
- **Code splitting** by Vite
- **Modern browser targets** (ES2020)

## Recommended Editor Setup
- **VS Code** with extensions:
  - TypeScript and JavaScript Language Features
  - ESLint extension  
  - Tailwind CSS IntelliSense
  - Auto Rename Tag
  - Prettier (if desired for formatting)

## Git Workflow
```powershell
# Standard workflow
git add .
git commit -m "feat: add new component"
git push origin main

# Feature branch workflow
git checkout -b feature/new-feature
git add .
git commit -m "feat: implement new feature"
git push origin feature/new-feature
```