# SupaSupa Development Guide

## Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Code Style
- **TypeScript**: Use strict mode with explicit return types
- **Components**: Use functional components with React.FC<Props> pattern
- **Naming**: PascalCase for components/interfaces, camelCase for functions/variables
- **Imports**: Group by source, use '@/' alias for internal paths
- **Styling**: Tailwind CSS with brutalist design system
- **Error Handling**: Try/catch with toast notifications for user feedback

## Structure
- Components modular with clear separation of concerns
- Use Context API for cross-component state management
- JSDoc comments for complex functions
- Optimize components with proper dependency arrays in hooks
- Follow responsive card system guidelines for consistent UI

## Tooling
- Next.js 15.x with App Router
- Supabase for authentication and database
- Explicit type definitions for all data models
- Tailwind CSS for styling