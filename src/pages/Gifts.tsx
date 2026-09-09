import GiftCard from '../components/GiftCard'
import Notice from '../components/Notice'
import Page from '../components/Page'
import { useGifts } from '../lib/useGifts'

export default function Gifts() {
  const { gifts, live, loading } = useGifts()
  return (
    <Page title="The gifts" intro="Eighteen pieces of solid pine, one drawn each month.">
      {!loading && !live && (
        <Notice>Build progress appears here once the season is under way.</Notice>
      )}
      <ul className="grid grid-cols-2 gap-3">
        {gifts.map((g) => (
          <GiftCard key={g.id} gift={g} />
        ))}
      </ul>
    </Page>
  )
}
