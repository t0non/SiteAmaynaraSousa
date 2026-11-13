import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, resolve, sep } from 'node:path'

const root = resolve(process.env.ROOT || 'site')
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.avif': 'image/avif', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.json': 'application/json' }
const port = Number(process.env.PORT || 4173)

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const relative = pathname.replace(/^\/+/, '')
    const file = resolve(root, extname(relative) ? relative : join(relative, 'index.html'))
    if (!file.startsWith(root + sep) || !types[extname(file)]) throw new Error('Rota inválida')
    const body = await readFile(file)
    response.writeHead(200, { 'Content-Type': types[extname(file)], 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' })
    response.end(request.method === 'HEAD' ? undefined : body)
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Página não encontrada.')
  }
}).listen(port, '127.0.0.1', () => console.log('Local: http://127.0.0.1:' + port + '/'))

