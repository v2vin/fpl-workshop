# FPL Workshop

A small phone-first web app for a private Fantasy Premier League mini league. Live table,
a monthly winner, and a prize draw where the winner enters a code and a handmade solid-pine
gift from VMS Woodwork (Malawi) is revealed.

Built with React, Vite, TypeScript and Tailwind on Firebase's free Spark plan. Standings are
synced from the FPL API by a GitHub Actions cron job; the browser only ever reads Firestore.

The project brief (data model, security rules, build order) is kept in a local `CLAUDE.md` that is
deliberately not committed.

## Develop

```
npm install
npm run dev        # Vite + Firebase emulators (Auth, Firestore)
npm run lint
npm run build
npm run deploy     # firebase deploy --only hosting,firestore:rules
```

The Firestore and Auth emulators need Java 11 or newer on your PATH. All Firebase CLI calls go
through `scripts/firebase.mjs`, which on Windows points the JDK at `C:/Users/Public` for its
Unix-domain wake-up sockets; without that the Firestore emulator exits on start on some machines.
