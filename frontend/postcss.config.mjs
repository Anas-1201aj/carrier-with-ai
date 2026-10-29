// The frontend uses @tailwindcss/vite (declared in vite.config.ts),
// which handles Tailwind CSS natively via the Vite plugin pipeline.
// No PostCSS plugins are needed here — this file exists only to
// prevent Vite from walking up to the root postcss.config.mjs
// (which belongs to the legacy Next.js app in app/).
const config = { plugins: {} }
export default config
