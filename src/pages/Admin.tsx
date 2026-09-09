import Notice from '../components/Notice'
import Page from '../components/Page'

export default function Admin() {
  return (
    <Page title="Admin" intro="Owner tools: close the month, issue a code, update a build.">
      <Notice>Sign in as the owner to use these tools.</Notice>
    </Page>
  )
}
