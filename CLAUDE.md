# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SpecMaster (服装配方管理系统) is a garment specification management system built with React, TypeScript, and the Refine framework. It manages a 4-level nested data structure: Style (款号) → ColorVariant (颜色版本) → BOMItem (配料明细) → SpecDetail (规格明细).

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run build:check  # TypeScript check + build
npm run lint         # ESLint (0 warnings tolerance)
```

## Architecture

### Tech Stack
- **Framework**: React 18 + Refine 4.47 (enterprise CRUD framework)
- **UI**: Ant Design 5.12 + Pro Components 2.6 + TailwindCSS 3.3
- **Build**: Vite 5.0
- **Language**: TypeScript 5.2

### Data Flow
All data operations use Refine hooks (`useOne`, `useList`, `useCreate`, `useUpdate`, `useDelete`) which abstract the data provider layer. Currently uses a mock data provider with in-memory storage (resets on page refresh).

### 4-Level Component Hierarchy
```
StyleDetailPage (L1)
  └─ StyleHeaderInfo → VariantTabs (L2)
      └─ VariantTabContent → VariantHeader + BOMTable (L3)
          └─ SpecDetailModalForm (L4 - modal-based editing)
```

### Key Directories
- `src/components/styles/` - Core business components for the 4-level hierarchy
- `src/pages/` - Route pages (styles, customers, sizes, units)
- `src/providers/mockDataProvider.ts` - Data provider implementation
- `src/mock/data.ts` - Mock data definitions
- `src/types/models.ts` - TypeScript interfaces (prefixed with `I`)

### Conventions
- **Types**: Interface names prefixed with `I` (e.g., `IStyle`, `IBOMItem`)
- **Components**: PascalCase filenames
- **L4 Editing**: Uses modal + `Form.List` pattern (not nested tables)
- **State**: Refine hooks for server state, `useState` for UI state only
- **Styling**: TailwindCSS utilities combined with Ant Design components (preflight disabled)

### Routes
- `/styles` - Style list (L1)
- `/styles/:id` - Style detail page (core feature)
- `/customers`, `/sizes`, `/units` - Auxiliary CRUD pages

## Adding a New CRUD Resource

1. Define interface in `src/types/models.ts`
2. Add mock data in `src/mock/data.ts`
3. Register resource in `mockDataProvider.ts` database object
4. Create list page in `src/pages/{resource}/list.tsx`
5. Register route and resource in `App.tsx`

## Switching to Real Backend

Replace `mockDataProvider` in `App.tsx` with a real data provider implementation. The Refine abstraction layer means component code remains unchanged.
