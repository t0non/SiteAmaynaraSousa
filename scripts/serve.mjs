// Servidor local do site (npm run dev): serve a pasta site/ e roda as funções de /api (igual à Vercel).
// As chaves do painel ficam no arquivo .env.local na raiz do projeto (não vai para o GitHub).
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { extname, join, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const projectRoot = resolve('.')
const envFile = join(projectRoot, '.env.local')
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const root = resolve(process.env.ROOT || 'site')
const apiRoot = join(projectRoot, 'api')
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.avif': 'image/avif', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.json': 'application/json' }
const port = Number(process.env.PORT || 4173)

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  // ---- funções /api ----
  if (pathname.startsWith('/api/')) {
    const rel = pathname.slice(5).replace(/\/+$/, '')
    const file = resolve(apiRoot, rel + '.js')
    if (!file.startsWith(apiRoot + sep) || rel.split('/').some((p) => p.startsWith('_')) || !existsSync(file)) {
      response.writeHead(404); return response.end()
    }
    try {
      const mod = await import(pathToFileURL(file).href + '?t=' + Date.now())
      return await mod.default(request, response)
    } catch (err) {
      console.error('[api]', rel, err)
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }); return response.end(String(err))
    }
  }
  // ---- arquivos estáticos ----
  try {
    const relative = pathname.replace(/^\/+/, '')
    const file = resolve(root, extname(relative) ? relative : join(relative, 'index.html'))
    if (!file.startsWith(root + sep) || !types[extname(file)]) throw new Error('Rota inválida')
    const body = await readFile(file)
    response.writeHead(200, { 'Content-Type': types[extname(file)], 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' })
    response.end(request.method === 'HEAD' ? undefined : body)
  } catch {
    try {
      const body = await readFile(join(root, '404.html'))
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); response.end(body)
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); response.end('Página não encontrada.')
    }
  }
}).listen(port, '127.0.0.1', () => console.log('Local: http://127.0.0.1:' + port + '/'))
