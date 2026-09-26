---
name: vercel-react-best-practices
description: Performance optimization, bundle minimization, memoization rules, and client-side efficiency patterns for React 19 and Next.js.
---

# Vercel React Performance Best Practices

## 1. Bundle Size Optimization
- **Dynamic Imports**: Use `next/dynamic` with `ssr: false` for heavy, client-only components (interactive charts, canvas visualizers, rich text editors).
- **Icon Tree Shaking**: Import icons from `lucide-react` using named imports or dedicated subpath imports to avoid bundling the entire icon library.
- **Dependency Vetting**: Never import heavy moment.js or lodash; use native modern JavaScript or lightweight alternatives (`date-fns`).

## 2. Rendering Efficiency
- **State Colocation**: Keep state as close to where it is used as possible. Avoid hoisting state to parent layouts when only a leaf child needs it.
- **Transitions**: Wrap non-urgent state updates (such as fleet filter changes) in `startTransition()` to keep the main thread responsive for typing and clicks.
- **Form Performance**: Use uncontrolled form elements via `react-hook-form` with Zod resolvers to prevent re-rendering the entire form on every keystroke.

## 3. Image Optimization
- Always use `next/image` with explicit `width`, `height`, and `sizes` attributes.
- Set `priority={true}` for above-the-fold hero banners to optimize Largest Contentful Paint (LCP).
- Provide low-quality blur placeholders (`placeholder="blur"`) for premium editorial imagery.
