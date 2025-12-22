import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// Use the official React plugin for fast refresh
export default defineConfig({
plugins: [react()],
})