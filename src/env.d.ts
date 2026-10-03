/// <reference types="astro/client" />

// Lets TypeScript accept side-effect imports of stylesheets, e.g. import '../styles/style.css'.
// Needed when "noUncheckedSideEffectImports" is on (TS 5.6+); Vite's own vite-env.d.ts does the same.
declare module '*.css' {}
