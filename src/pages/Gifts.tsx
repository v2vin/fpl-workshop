import { Link } from 'react-router'
import GiftCard from '../components/GiftCard'
import Page from '../components/Page'
import { useGifts } from '../lib/useGifts'

export default function Gifts() {
  const { gifts } = useGifts()
  return (
    <Page
      title="What’s on the bench."
      intro={`${gifts.length} handmade gifts. Win a month and one is drawn for you at random.`}
    >
      <ul className="grid grid-cols-2 gap-x-3 gap-y-6 pt-1">
        {gifts.map((g, i) => (
          <li key={g.id}>
            <GiftCard gift={g} number={i + 1} />
          </li>
        ))}
      </ul>
      <p className="border-t border-pine-200 pt-4 text-xs leading-relaxed text-stone-600">
        Handmade, so every piece varies from its photos in colour, grain and finish. Prizes have no
        cash value and can’t be swapped. Delivery within Malawi.{' '}
        <Link to="/rules" className="underline underline-offset-2">
          Prize rules
        </Link>
      </p>
    </Page>
  )
}
