import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

// Firebase web config. This is not a secret: Firestore rules protect the data (CLAUDE.md,
// "Repository and secrets"). Placeholders work against the emulators in dev.
//
// TODO(owner): register a Web app in the Firebase console (Project settings → Your apps → Web,
// no Hosting SDK, no Analytics) and paste apiKey, messagingSenderId and appId here before the
// first deploy. Do not add measurementId or import firebase/analytics.
const firebaseConfig = {
  apiKey: 'TODO-paste-from-console',
  authDomain: 'fpl-workshop.firebaseapp.com',
  projectId: 'fpl-workshop',
  messagingSenderId: '571738430569',
  appId: 'TODO-paste-from-console',
}

if (!import.meta.env.DEV && firebaseConfig.apiKey.startsWith('TODO')) {
  console.error('Firebase web config is still a placeholder. See src/lib/firebase.ts.')
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Always develop against the emulators (CLAUDE.md, "Stack"). Ports match firebase.json.
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
