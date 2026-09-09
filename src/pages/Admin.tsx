import Notice from '../components/Notice'
import Page from '../components/Page'

// Reached only through <RequireOwner>.
export default function Admin() {
  return (
    <Page title="Admin" intro="Owner tools: close the month, issue a code, update a build.">
      <Notice>Nothing to do yet. Gift status controls come next, then code issuing.</Notice>
    </Page>
  )
}
