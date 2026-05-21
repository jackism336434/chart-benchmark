import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          echarts: ['echarts'],
          chartjs: ['chart.js', 'react-chartjs-2', 'chartjs-plugin-zoom', 'chartjs-chart-financial'],
          plotly: ['plotly.js-dist-min', 'react-plotly.js'],
        },
      },
    },
  },
})
