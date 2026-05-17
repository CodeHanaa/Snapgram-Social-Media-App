import path from "path" // 👈 1. استدعي مسارات النظام
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // 👈 2. عرّفي علامة الـ @ هنا
    },
  },
})
