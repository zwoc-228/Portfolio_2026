#!/usr/bin/env node
// Side-by-side: reference/ui-baseline.png (LEFT) vs latest render (RIGHT)
// + close crops row. No image deps: serves files over HTTP, composites in
// the browser via <img> tags, screenshots the page.
//
// Usage: node scripts/compare.mjs [--shot path] [--out path]
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(root, '..')
const args = process.argv.slice(2)
const opt = (k, d) => {
  const i = args.indexOf(k)
  return i >= 0 && args[i + 1] ? args[i + 1] : d
}
const shot = opt('--shot', null)
const out = opt('--out', path.join(root, '__compare.png'))
const PORT = 4175

const MIME = { '.png': 'image/png', '.html': 'text/html' }
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')
  if (url.pathname === '/') {
    const ref = '/reference/ui-baseline.png'
    const cur = shot ? `/shot/${path.basename(shot)}` : ''
    const crops = ['writing', 'architecture', 'research']
      .map((c) => {
        const f = path.join(root, `__shots/crop-${c}.png`)
        return fs.existsSync(f)
          ? `<figure><img src="/crop/crop-${c}.png"><figcaption>${c}</figcaption></figure>`
          : ''
      })
      .join('')
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`<!DOCTYPE html><html><head><style>
body{margin:0;background:#222;color:#999;font:12px monospace}
.row{display:flex} .row img{width:50%;display:block}
.crops{display:flex} .crops figure{margin:0;width:33.3%} .crops img{width:100%;display:block}
figcaption{padding:4px 8px}</style></head><body>
<div class="row"><img src="${ref}"><img src="${cur}"></div>
<div class="crops">${crops}</div></body></html>`)
    return
  }
  let file = null
  if (url.pathname === '/reference/ui-baseline.png') file = path.join(repo, 'reference/ui-baseline.png')
  else if (url.pathname.startsWith('/shot/')) file = shot
  else if (url.pathname.startsWith('/crop/')) file = path.join(root, '__shots', path.basename(url.pathname))
  if (!file || !fs.existsSync(file)) {
    res.writeHead(404)
    res.end()
    return
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})

await new Promise((r) => server.listen(PORT, r))
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1200 } })
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load', timeout: 30000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: out, fullPage: true, timeout: 60000 })
  console.log(`COMPARE -> ${out}`)
} finally {
  await browser.close()
  await new Promise((r) => server.close(r))
}
