import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    port:5173,
    strictPort: true,
    host: true,
    watch: {
      //Precaución poco ideal a problemas de detección de cambio de archivos desde WSL
      //Se pregunta persistentemente por cambios para hot reload. Aumenta el consumo de CPU
      usePolling: true,
    },
    hmr: {
      clientPort: 5173 //HMR: Acualizar modulos individuales sin recargar todo
    }
  },
})
