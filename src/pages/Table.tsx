import Notice from '../components/Notice'
import Page from '../components/Page'

export default function Table() {
  return (
    <Page title="League table" intro="Standings, this month’s leaders and the next deadline.">
      <Notice>The table appears here once the first sync from FPL has run.</Notice>
    </Page>
  )
}
