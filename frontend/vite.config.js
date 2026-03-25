import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function externalDataPlugin() {
  const dataRoot = path.resolve(__dirname, '../data')

  const serveDataFile = (req, res, next) => {
    const reqPath = decodeURIComponent((req.url || '').split('?')[0])
    const relativePath = reqPath.replace(/^\/+/, '')
    const filePath = path.resolve(dataRoot, relativePath)

    // Block path traversal and only allow files under ../data.
    if (!(filePath === dataRoot || filePath.startsWith(dataRoot + path.sep))) {
      res.statusCode = 403
      res.end('Forbidden')
      return
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.statusCode = 404
      res.end('Not found')
      return
    }

    if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
    }

    fs.createReadStream(filePath).pipe(res)
  }

  return {
    name: 'external-data-plugin',
    configureServer(server) {
      server.middlewares.use('/data', serveDataFile)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/data', serveDataFile)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), externalDataPlugin()],
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  }
})
