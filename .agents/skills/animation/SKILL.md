---
name: animation
description: Motion choreography, Framer Motion patterns, accessible motion preferences, and performance guidelines for micro-interactions.
---

# Motion & Interaction Design Standards

## 1. Principles of Purposeful Motion
- **Informing over Entertaining**: Motion should communicate state changes, spatial hierarchy, and direct user focus rather than serving as visual decoration.
- **Micro-Interactions**: Subtle elevation on vehicle cards (`translate-y-[-2px]`), smooth accordion expansion, and fluid modal enter/exit transitions.
- **Snappy Durations**: Fast, crisp interaction timing (150ms to 250ms for UI controls; 400ms to 600ms for hero reveals with gentle ease-out curves).

## 2. Framer Motion Implementation
```typescript
import { motion, AnimatePresence } from "framer-motion";

export const fadeInVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
};
```

## 3. Accessibility & Reduced Motion
Always respect the user's OS-level motion preferences using Tailwind's `motion-reduce` utility or Framer Motion's `useReducedMotion()` hook:
```typescript
import { useReducedMotion } from "framer-motion";

export function VehicleCardAnimation({ children }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}
```
