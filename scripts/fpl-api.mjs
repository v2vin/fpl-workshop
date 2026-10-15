// GET a JSON endpoint of the unofficial FPL API, with retries. Shared by fetch-fpl.mjs and
// verify-teams.mjs. FPL_API points the scripts at a stand-in server for local testing.
const FPL = process.env.FPL_API ?? 'https://fantasy.premierleague.com/api'

/** Resolves with the parsed body, or rejects after three failed attempts. */
export async function fplGet(path, attempt = 1) {
  const url = `${FPL}${path}`
  try {
    const res = await fetch(url, {
      headers: {
        // FPL answers 403 to some default agents; a browser-like one is reliable.
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36',
        Accept: 'application/json',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    if (attempt >= 3) {
      throw new Error(`${url} failed after ${attempt} attempts: ${err.message}`, { cause: err })
    }
    await new Promise((r) => setTimeout(r, 1500 * attempt))
    return fplGet(path, attempt + 1)
  }
}
