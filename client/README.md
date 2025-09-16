# Reflect Client

React + TypeScript frontend for the Reflect feedback management system.

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router v6
- TanStack Query
- Zustand

## Linting Commands

```bash
# Navigate to client directory
cd /home/indira/Documents/github/reflect/client

# 1. Run linter (check only)
npm run lint

# 2. Auto-fix what can be fixed
npx eslint . --fix

# 3. Run Prettier to format code
npx prettier --write .

# 4. TypeScript type checking
npx tsc --noEmit

# 5. Run all together
npm run lint && npx prettier --write . && npx tsc --noEmit
```