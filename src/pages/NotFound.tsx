import { Link } from 'react-router'
import Notice from '../components/Notice'
import Page from '../components/Page'

export default function NotFound() {
  return (
    <Page title="Off the pitch" intro="That page does not exist.">
      <Notice>
        <Link to="/" className="text-pitch-700 font-medium underline">
          Back to the table
        </Link>
      </Notice>
    </Page>
  )
}
