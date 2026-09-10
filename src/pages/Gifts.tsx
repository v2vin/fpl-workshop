import GiftCard from '../components/GiftCard'
import Page from '../components/Page'
import { useGifts } from '../lib/useGifts'

export default function Gifts() {
  const { gifts } = useGifts()
  return (
    <Page
      title="Pick your favourite."
      intro={`${gifts.length} pine gifts. One good month to win one.`}
    >
      <ul className="grid grid-cols-2 gap-x-3 gap-y-6 pt-1">
        {gifts.map((g, i) => (
          <li key={g.id}>
            <GiftCard gift={g} number={i + 1} />
          </li>
        ))}
      </ul>
    </Page>
  )
}
