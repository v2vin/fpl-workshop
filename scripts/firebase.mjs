#!/usr/bin/env node
// Runs the Firebase CLI with a workaround for a Windows quirk that kills the Firestore emulator
// on start ("Unable to establish loopback connection ... Invalid argument: connect").
//
// Java NIO selectors create an AF_UNIX wake-up socket under %TEMP%. On some Windows machines,
// including the owner's, connecting to a Unix socket in that folder fails, so every selector
// fails and the emulator exits with code 1. Pointing the JDK at a short directory fixes it.
// Usage: node scripts/firebase.mjs <firebase args...>   e.g.  emulators:start --only auth,firestore
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'

const env = { ...process.env }
if (
  os.platform() === 'win32' &&
  !/jdk\.net\.unixdomain\.tmpdir/.test(env.JAVA_TOOL_OPTIONS ?? '')
) {
  const dir = ['C:/Users/Public', 'C:/Windows/Temp'].find(existsSync)
  if (dir) {
    env.JAVA_TOOL_OPTIONS = [env.JAVA_TOOL_OPTIONS, `-Djdk.net.unixdomain.tmpdir=${dir}`]
      .filter(Boolean)
      .join(' ')
    console.error(`firebase.mjs: JAVA_TOOL_OPTIONS=${env.JAVA_TOOL_OPTIONS}`)
  }
}

// A missing --import directory is an error for the CLI on a fresh clone, so drop the flag until
// the first export has created it.
const args = process.argv.slice(2).filter((a) => {
  const m = /^--import=(.+)$/.exec(a)
  if (m && !existsSync(m[1])) {
    console.error(`firebase.mjs: ${m[1]} does not exist yet, starting with empty emulators`)
    return false
  }
  return true
})

const bin = createRequire(import.meta.url).resolve('firebase-tools/lib/bin/firebase.js')
const child = spawn(process.execPath, [bin, ...args], { stdio: 'inherit', env })
child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)))
