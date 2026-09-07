// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // FIX: with no host set, Vite's default binding behavior on this
    // machine resolved to IPv6 loopback only ([::1]), confirmed directly
    // via `netstat -ano | findstr :5173` — nothing was listening on the
    // IPv4 loopback (127.0.0.1) at all, which is exactly why
    // http://127.0.0.1:5173 was refused even though the terminal
    // reported the server as ready. `host: true` makes Vite listen on
    // every available network interface (0.0.0.0 for IPv4 and :: for
    // IPv6), so both "localhost" and "127.0.0.1" work regardless of
    // which one the OS/browser happens to resolve first.
    host: true,
  },
});

