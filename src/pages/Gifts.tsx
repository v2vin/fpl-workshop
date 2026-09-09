import Page from '../components/Page'
import { gifts } from '../data/gifts'

// Step 1 preview from seed data so the placeholder heroes can be checked.
// Step 4 replaces this with live Firestore data, status badges and the photo strip.
export default function Gifts() {
  return (
    <Page title="The gifts" intro="Eighteen pieces of solid pine, one drawn each month.">
      <ul className="grid grid-cols-2 gap-3">
        {gifts.map((g) => (
          <li
            key={g.id}
            className="border-pine-200 overflow-hidden rounded-xl border bg-white shadow-sm"
          >
            <img
              src={g.photos[0]}
              alt={g.name}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="p-3">
              <h2 className="text-sm leading-tight font-semibold">{g.name}</h2>
              <p className="mt-1 text-xs text-stone-600">{g.blurb}</p>
            </div>
          </li>
        ))}
      </ul>
    </Page>
  )
}
