import Notice from '../components/Notice'
import Page from '../components/Page'
import SignInButton from '../components/SignInButton'
import { useAuth } from '../lib/auth'

export default function Draw() {
  const { user, loading } = useAuth()
  return (
    <Page
      title="The draw"
      intro="Won the month? Enter your code and see what is coming out of the workshop."
    >
      {loading ? null : user ? (
        <Notice>Code entry opens with the first draw.</Notice>
      ) : (
        <Notice>
          <p className="mb-3">Sign in to enter a code.</p>
          <SignInButton />
        </Notice>
      )}
    </Page>
  )
}
