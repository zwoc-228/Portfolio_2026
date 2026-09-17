#!/usr/bin/env node
// Reusable browser visual verification (Playwright + Chromium).
// Serves dist/ via `vite preview`, screenshots two viewports, logs
// console errors / failed requests / 404s. Compares are manual against
// reference/ui-baseline.png (or pass --ref for pixel info only).
//
// Usage:
//   npm run build && node scripts/visual-check.mjs [--url URL] [--out DIR]
//   URL defaults to the local preview server it spawns itself.
//   For the live site: --url https://zwoc-228.github.io/Portfolio_2026/
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
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
const outDir = opt('--out', path.join(root, '__shots'))
const liveUrl = opt('--url', null)
// --dist: which build to serve. Default repo dist/; on OneDrive-synced Macs
// prefer an outside-OneDrive build (OneDrive renames dist/assets on rewrite).
const distOpt = opt('--dist', null)
const TMPDIST = '/var/folders/h5/ztxj_66j2wlcdkxmpvs70k9h0000gn/T/opencode/dist-check'
const PORT = 4173
const BASE = '/Portfolio_2026/'

fs.mkdirSync(outDir, { recursive: true })

let server = null
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream',
  '.woff2': 'font/woff2',
}
// vite preview serves dist at root, but the build uses BASE_URL paths.
// Serve dist/ mounted at BASE with SPA fallback — mirrors GitHub Pages.
async function startPreview() {
  const dist = distOpt ?? path.join(repo, 'dist')
  server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost')
    let p = decodeURIComponent(url.pathname)
    if (!p.startsWith(BASE)) {
      res.writeHead(404)
      res.end('not found')
      return
    }
    p = p.slice(BASE.length)
    let file = path.join(dist, p)
    if (p === '' || p.endsWith('/')) file = path.join(dist, 'index.html')
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(dist, 'index.html') // SPA fallback (mirrors 404.html)
    }
    const ext = path.extname(file)
    res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' })
    fs.createReadStream(file).pipe(res)
  })
  await new Promise((resolve) => server.listen(PORT, resolve))
  console.log(`preview: http://localhost:${PORT}${BASE} (serving dist/)`)
}

const viewports = [
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'macbook-1440', width: 1440, height: 900 },
]

// Extra query string for A/B runs, e.g. --query "?tm=agx".
const extraQuery = opt('--query', '')
// Close crops for material inspection (1920-space regions, desktop only).
const wantCrops = args.includes('--crops')
const CROPS = [
  { name: 'writing', x: 240, y: 470, width: 460, height: 270 },
  { name: 'architecture', x: 670, y: 390, width: 560, height: 310 },
  { name: 'research', x: 1200, y: 490, width: 440, height: 250 },
]

const browser = await chromium.launch()
let failures = 0
try {
  if (!liveUrl) await startPreview()
  const base = liveUrl ?? `http://localhost:${PORT}${BASE}`
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    const problems = []
    page.on('console', (m) => {
      if (m.type() === 'error') problems.push(`console.error: ${m.text().slice(0, 200)}`)
    })
    page.on('pageerror', (e) => problems.push(`pageerror: ${String(e).slice(0, 200)}`))
    page.on('response', (r) => {
      if (r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url().slice(0, 120)}`)
    })
    const stamp = `${extraQuery}${extraQuery.includes('?') ? '&' : '?'}t=${Date.now()}`
    const url = `${base}${stamp}`
    // domcontentloaded + fixed settle: networkidle never fires while
    // Troika streams its runtime font; WebGL needs seconds to compile.
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(12000)
    const glInfo = await page.evaluate(() => {
      const c = document.createElement('canvas')
      const gl = c.getContext('webgl2')
      const ext = gl ? gl.getExtension('WEBGL_debug_renderer_info') : null
      return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown'
    }).catch(() => 'probe-failed')
    console.log(`GL ${vp.name}: ${String(glInfo).slice(0, 80)}`)
    const shot = path.join(outDir, `${vp.name}.png`)
    await page.screenshot({ path: shot, timeout: 120000 })
    console.log(`SHOT ${vp.name} -> ${shot}`)
    if (wantCrops && vp.width === 1920) {
      for (const c of CROPS) {
        const cp = path.join(outDir, `crop-${c.name}.png`)
        await page.screenshot({ path: cp, clip: c, timeout: 120000 })
        console.log(`CROP ${c.name} -> ${cp}`)
      }
    }
    if (problems.length) {
      failures += problems.length
      console.log(`PROBLEMS ${vp.name}:`)
      for (const p of problems.slice(0, 20)) console.log(`  - ${p}`)
    } else {
      console.log(`CLEAN ${vp.name}: no console/page/HTTP errors`)
    }
    await page.close()
  }
} finally {
  await browser.close()
  if (server) await new Promise((r) => server.close(r))
}
console.log(failures ? `visual-check: ${failures} problem(s)` : 'visual-check: OK')
process.exit(0)
