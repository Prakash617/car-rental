---
name: accessibility
description: WCAG 2.1 AA accessibility guidelines, screen reader semantics, keyboard focus traps, and accessible color contrast.
---

# Web Accessibility (a11y) Standards

## 1. Core Mandates (WCAG 2.1 AA)
- **Keyboard Operability**: Every interactive element must be reachable and operable via keyboard (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`).
- **Visible Focus Indicators**: Never apply `outline: none` without providing a distinct replacement (`focus-visible:ring-2 focus-visible:ring-primary`).
- **Semantic HTML**: Use native semantic landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<section>`).

## 2. Dialog & Drawer Focus Trapping
- Radix UI primitives handle focus trapping automatically. When a modal opens, focus moves to the first focusable child; pressing `Escape` closes the modal and returns focus to the trigger button.
- Ensure dialogs have `DialogTitle` and `DialogDescription` for screen reader announcements.

## 3. Form Accessibility
- Every form input must have an associated `<label>` connected via `htmlFor` and `id`.
- Error messages must be linked to inputs using `aria-describedby` and flagged with `aria-invalid="true"`.
