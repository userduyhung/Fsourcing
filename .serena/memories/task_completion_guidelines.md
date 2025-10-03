# Task Completion Guidelines

## Before Completing Any Development Task

### Code Quality Checklist
1. **Run ESLint**: `npm run lint`
   - Fix all linting errors and warnings
   - Ensure TypeScript strict mode compliance
   - Check for unused variables/imports

2. **TypeScript Validation**
   - Verify no TypeScript compilation errors
   - Ensure proper type definitions
   - Check `npx tsc --noEmit` passes

3. **Build Verification**
   - Run `npm run build` successfully
   - Test production build with `npm run preview`
   - Verify no build-time errors

### Testing & Validation (Future)
*Note: No testing framework currently configured*
- When tests are added, run full test suite
- Ensure component rendering tests pass
- Validate responsive design across breakpoints

### Code Review Standards
- **Component Structure**: Follow established patterns in App.tsx
- **Styling**: Use Tailwind utilities consistently
- **TypeScript**: Maintain strict typing standards
- **Performance**: Avoid unnecessary re-renders
- **Accessibility**: Include proper ARIA labels and semantic HTML

## Deployment Preparation

### Pre-deployment Checklist
1. **Environment Variables**: Ensure all necessary env vars are configured
2. **Assets**: Verify all images and external resources load correctly
3. **Performance**: Check bundle size and loading performance
4. **Browser Compatibility**: Test in major browsers
5. **Mobile Responsiveness**: Verify mobile experience

### Build Output Validation
```powershell
# Clean build
rm -rf dist
npm run build

# Verify build contents
ls dist
# Should contain: index.html, assets/, favicon, etc.

# Test production build locally
npm run preview
```

## Documentation Updates
When adding new features:

1. **Update README** if applicable
2. **Document new components** with TypeScript interfaces
3. **Update memory files** for significant architectural changes
4. **Add comments** for complex business logic

## Git Commit Standards
- Use conventional commit format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Keep commits atomic and focused
- Write clear, descriptive commit messages

## Common Completion Tasks
- **Feature Addition**: Lint → Build → Test → Commit
- **Bug Fix**: Fix → Lint → Build → Test → Commit  
- **Refactoring**: Refactor → Lint → Build → Test → Commit
- **Styling**: Style → Build → Visual Test → Commit

## Performance Considerations
- Monitor bundle size after changes
- Use React.memo() for expensive components (when needed)
- Optimize images and assets
- Consider code splitting for large features (future)

## Security Review
- Validate any external data inputs
- Ensure no sensitive data in client code
- Review third-party dependencies for vulnerabilities
- Follow OWASP guidelines for web security