// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

type NitroOption = NonNullable<NonNullable<Parameters<typeof defineConfig>[0]>["nitro"]>;

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Nitro's rolldown code-splitting emits two mutually-importing SSR chunks
  // (server-<hash>.mjs and server-<hash>2.mjs). The cycle leaves TanStack's
  // createMiddleware/createCsrfMiddleware in the ESM temporal dead zone, so the
  // function crashes at import time with "createMiddleware is not a function"
  // and every route returns the 500 error page. Emitting a single SSR bundle
  // removes the cycle.
  //
  // `inlineDynamicImports` is a real Nitro option (it makes Nitro set
  // codeSplitting: false) but is missing from this wrapper's narrower option
  // type, so the cast is needed to pass it through.
  nitro: { inlineDynamicImports: true } as unknown as NitroOption,
});
