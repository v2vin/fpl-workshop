# UI design brief — FPL Workshop

Paste everything below the line into an AI design tool (Claude Design, v0, Figma AI, Galileo…).
Ask for one artboard per screen, phone-first, then a components sheet.

---

You are designing the user interface for **FPL Workshop**, a small app for a private Fantasy
Premier League (FPL) mini league of about 17 friends in Malawi, run by Vitumbiko, who also runs a
one-man carpentry workshop called **VMS Woodwork**. Every month the league's top scorer wins a
small handmade solid-pine gift, revealed through a draw in the app and photographed as it is built.
The app has two jobs, in this order: make the league more fun, and show off the woodwork.

Design for the phone first. Everyone uses it on a phone, mostly Android, inside WhatsApp's
in-app browser or installed to the home screen as a PWA. Later the same design ships as Android
and iOS apps, so nothing may depend on hover, keyboard shortcuts or wide layouts.

## Feel

Warm workshop meets matchday. Think a pine offcut with the grain showing, laid on a green pitch.
Friendly, honest, a little bit football-flavoured, never corporate, never gamified with confetti
and streaks. Imperfect handmade objects are the point, so photography is hero content: give real
photos room and never crop the piece.

## Visual system (already in the code, keep it)

- **Pine palette** (wood, cards, highlights): 50 `#fbf7ee`, 100 `#f3e7cf`, 200 `#e8d3a8`,
  300 `#dbbb7e`, 400 `#c99f5c`, 500 `#b5843f`, 600 `#946733`, 700 `#744f2a`, 800 `#533921`,
  900 `#362515`.
- **Pitch palette** (headers, primary actions): 50 `#eef7f1`, 100 `#d5ebdc`, 200 `#aed7bc`,
  300 `#7dbd95`, 400 `#4f9e70`, 500 `#2f7d4f`, 600 `#256640`, 700 `#1b4d31`, 800 `#143a25`,
  900 `#0e2a1b`.
- Page background pine-50; cards white with a pine-200 hairline and soft shadow; body text
  stone-900 / stone-600; primary button pitch-700 with white text; WhatsApp actions `#25D366`.
- Header bar pitch-800 with pine-100 text and a small pine-300 "plank" mark before the name.
- Bottom tab bar, five tabs: Table, Draw, Gifts, Cabinet, About. Admin is not a tab; it is a pill
  in the header that only the owner sees.
- Type: the system sans (Segoe / Roboto / SF). Titles bold and tight; numbers in a monospace
  face so points columns line up.
- Radius 12 px on cards, full pills for badges and buttons. Corners and shadows soft, not glassy.
- Status badges for gifts: **Up for grabs** (stone), **Drawn** (pine), **Cut** (sky),
  **Glued up** (violet), **Finished** (pitch light), **Delivered** (pitch dark, pine text).

## Copy rules

British English. Short, friendly, football-flavoured. No exclamation marks in system text.
Talk to one manager ("your shelf", "your code"). Woodworking sizes in millimetres, thickness ×
width × length, e.g. `20×90×260`.

## Data you can show (real shapes)

- League table row: rank, movement vs last gameweek (▲2 / ▼1 / •), manager name, team name,
  gameweek points, total points.
- Month: name (e.g. September 2026), gameweeks covered (GW 3–5), state Live or Closed, rows of
  manager + points, leader marked with ★, tie note "Level on points at the top. Higher season
  total takes it."
- Deadline: "Gameweek 4 deadline · Sat 12 Sept, 14:30 · in 2d 16h".
- Gift: name, one-line blurb, build notes (materials, hours, bought-in parts), status, photos
  (hero + progress strip), "Won September 2026 by Vinjeru".
- Code: `FPLW-SEP26-7F3K` (always this shape), month, winner, gift, revealed or waiting.
- The 18 gifts: phone stand, headphone stand, pen block, manager's name plate, bookends,
  coaster set + holder, wall bottle opener + cap catcher, six-bottle drinks caddy, wine bottle
  balance holder, remote caddy, sofa armrest tray, kitchen roll stand, mug tree, key and hook
  rail, tea-light holder, snack board, team-sheet chalkboard, octagonal wall clock.

## Screens to design — v1 (live today, redesign freely within the system)

1. **Table** (home). League name, "Gameweek 3 · updated 1 hour ago", deadline card with
   countdown, "This month" leaders (top 5, GW range, Live/Closed badge), full season table with
   movement arrows, the signed-in manager's own row highlighted. Empty state before the first
   sync. Signed-out visitors see everything here.
2. **Draw**. Signed out: explain and offer Google sign-in. Signed in: a single code field
   (monospace, uppercase), "Reveal my gift". States: checking; wrong code ("That code is not
   yours, or does not exist."); **shuffle** — all 18 gift cards in a 3-column grid lighting up
   in turn, slowing down, landing on the winner's gift, about 5 seconds; **reveal** — big hero
   photo, "SEPTEMBER 2026 WINNER", gift name, blurb, build notes, Share to WhatsApp, link to
   cabinet; **already revealed** — same card with a calm notice. The shuffle is theatre: the gift
   was chosen when the owner issued the code, and the About page says so.
3. **Gifts**. Two-column grid of the 18 gifts: hero photo with the status badge overlaid,
   name, blurb, "Won … by …", horizontal strip of progress photos, collapsible build notes.
   Design the card for a real 4:3 workshop photo, with the placeholder (pine-coloured board with
   the gift name) as the fallback.
4. **Cabinet**. "Your shelf" (gifts this manager has won, empty state "Nothing on your shelf
   yet. Win a month."), public "Wall of winners" (month, name, gift, status), "Your account"
   (name, FPL team id, user id).
5. **About**. Three short sections: the league (monthly winner rule, tie-break), the draw
   (chosen at issue time, shuffle is for show, codes are single-use), the workshop.
6. **Admin** (owner only). Issue a code: month picker defaulting to last month, a close-month
   summary ("Month closed. Leader: Chawezi S on 181 points (next: Umodzi, 174)") with a one-tap
   "pick the leader", winner dropdown, "Issue code (18 gifts left)"; result card with the code
   in large monospace, the gift name ("keep that to yourself"), and "Send code on WhatsApp".
   Issued codes list (code, month, winner, gift, Revealed/Waiting). Builds list: every gift with
   a status select, "add photo" by file name, make-hero and remove photo chips.
7. **Shared pieces**. Header with sign-in / avatar / sign-out / Admin pill; bottom tab bar;
   "Link your FPL team" one-off prompt; "Put FPL Workshop on your home screen" install hint
   (Android Install button, iOS Share-menu instructions); 404 "Off the pitch".

## Screens to design — v2 ideas (not built; explore, keep the same system)

8. **Wooden spoon**. The month's lowest scorer "wins" a real pine spoon. A tongue-in-cheek card
   on the Table and a spoon shelf in the Cabinet. Gentle, never humiliating.
9. **Gameweek mini-awards**. After each gameweek: bench points wasted, worst captain pick,
   biggest riser. Small award tiles with a pine "medal" mark, a history list, and a share card.
10. **Captaincy poll**. Before each deadline, managers vote on who they are captaining; results
    revealed after the deadline. Poll card on the Table, a results bar chart, "you picked" marker.
11. **Chip tracker**. Who has used Wildcard, Bench Boost, Triple Captain, Free Hit. A compact
    grid: managers down, chips across, used/unused marks, with the current gameweek noted.
12. **Head-to-head cup**. Knockout bracket drawn from the league, one tie per gameweek. Bracket
    view that works on a phone (scroll by round), tie card with both scores, winner advances.
13. **Season finale weighted draw**. End-of-season draw where more monthly wins mean more
    tickets. A ticket wallet per manager, a live draw screen in the spirit of the shuffle, and a
    winners' gallery.

## Deliverables

- One artboard per screen at 375 × 812, plus the key states named above (loading, empty, error,
  signed out) where they differ.
- A components sheet: buttons, badges, cards, table row, tab bar, header, prompts, share button.
- Keep everything implementable in Tailwind with the tokens above. No new colours, no gradients,
  no illustration style that clashes with real workshop photography.
- Where you show photos, use realistic pine woodwork shots, small objects on a bench, natural
  light. No stock trophies, no cartoon footballs.
