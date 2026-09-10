import { Link } from 'react-router'
import CodesList from '../components/CodesList'
import IssueCode from '../components/IssueCode'
import Notice from '../components/Notice'
import Page from '../components/Page'
import { useGifts } from '../lib/useGifts'

// Reached only through <RequireOwner>.
export default function Admin() {
  const { gifts, live, loading } = useGifts()
  return (
    <Page title="Workshop desk" intro="Owner only">
      {!loading && !live && (
        <Notice>
          The gifts collection is empty, so nothing can be issued yet. Run{' '}
          <code className="rounded bg-white px-1">npm run seed:gifts</code> once.
        </Notice>
      )}
      {live && <IssueCode gifts={gifts} />}
      {live && <CodesList gifts={gifts} />}
      <Link to="/admin/builds" className="btn mt-2 w-full">
        Manage builds →
      </Link>
    </Page>
  )
}
