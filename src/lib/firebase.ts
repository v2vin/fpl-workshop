import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

// Firebase web config. This is not a secret: Firestore rules protect the data (CLAUDE.md,
// "Repository and secrets"). Placeholders work against the emulators in dev.
//
// Web app "FPL Workshop" registered 2026-09-09 via `firebase apps:create`. Deliberately without
// storageBucket (no Storage) and measurementId (no Analytics) — see CLAUDE.md constraints.
const firebaseConfig = {
  apiKey: 'AIzaSyD0QREKdgi8_KGjrF61-uxmU3lQLNDjXFI',
  // The Hosting domain the league will use, not the default firebaseapp.com one: the redirect
  // sign-in fallback only works when the auth handler is same-site with the app, and Firebase
  // Hosting serves /__/auth/ on both domains. Share the .web.app URL, never firebaseapp.com.
  authDomain: 'fpl-workshop.web.app',
  projectId: 'fpl-workshop',
  messagingSenderId: '571738430569',
  appId: '1:571738430569:web:de19ced450055a0d16d6f8',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Always develop against the emulators (CLAUDE.md, "Stack"). Ports match firebase.json. Use
// localhost, not 127.0.0.1: Vite serves on localhost, and the redirect sign-in fallback only
// completes when the emulator's auth iframe is same-site with the app (storage partitioning).
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, 'localhost', 8080)
}
