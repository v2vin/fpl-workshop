#!/usr/bin/env node
// Renders the PWA icons from public/favicon.svg. Run once after changing the favicon:
//   node scripts/make-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const svg = readFileSync('public/favicon.svg')
const out = (name, buf) => writeFileSync(`public/icons/${name}`, buf)

// Plain icons: the SVG already has rounded corners and a pitch-green ground.
out('icon-192.png', await sharp(svg).resize(192, 192).png().toBuffer())
out('icon-512.png', await sharp(svg).resize(512, 512).png().toBuffer())
// Maskable: full-bleed pitch green with the mark kept inside the 80% safe zone.
const mark = await sharp(svg).resize(400, 400).png().toBuffer()
out(
  'icon-maskable-512.png',
  await sharp({ create: { width: 512, height: 512, channels: 4, background: '#1b4d31' } })
    .composite([{ input: mark, gravity: 'centre' }])
    .png()
    .toBuffer(),
)
// iOS home-screen icon: opaque, 180 px, iOS rounds the corners itself.
const mark180 = await sharp(svg).resize(150, 150).png().toBuffer()
out(
  'apple-touch-icon.png',
  await sharp({ create: { width: 180, height: 180, channels: 4, background: '#1b4d31' } })
    .composite([{ input: mark180, gravity: 'centre' }])
    .png()
    .toBuffer(),
)
console.log('icons written to public/icons/')
