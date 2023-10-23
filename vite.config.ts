import { defineConfig } from 'vite'
import path from 'path';
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
		alias: {
			"@components": path.resolve("./src/components"),
			"@models": path.resolve("./src/model"),
			"@styles": path.resolve("./src/styles"),
			"@network": path.resolve("./src/Network.ts"),
			"@stores": path.resolve("./src/stores"),
			"@src": path.resolve("./src"),
		},
	},
})
