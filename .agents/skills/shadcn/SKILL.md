---
name: shadcn
description: Reusable accessible UI primitives, Radix UI integration, Tailwind design token binding, and custom form controls.
---

# shadcn/ui Component Standards

## 1. Primitives Philosophy
- shadcn/ui components are not an npm black box; they live directly in `src/components/ui/` as copy-paste, fully-owned source code.
- Every component is built on top of accessible Radix UI primitives with zero styling assumptions outside of Tailwind utility tokens.

## 2. Component Customization Guidelines
- **Variants via `class-variance-authority` (cva)**: Define variants (default, secondary, destructive, outline, ghost, link) with consistent sizing options (sm, default, lg, icon).
- **Tailwind Merge (`cn()`)**: Always use the `cn()` utility (`clsx` + `tailwind-merge`) when applying dynamic class names to ensure caller classes override default component classes without conflict.
- **Form Controls**: Bind all form inputs through `react-hook-form` and `<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`.

## 3. Mandatory Component Inventory
Ensure the following accessible primitives are present in `src/components/ui/`:
`button`, `input`, `badge`, `card`, `dialog`, `sheet`, `dropdown-menu`, `select`, `table`, `tabs`, `tooltip`, `separator`, `calendar`, `popover`, `skeleton`, `toast`.
