import Notice from '../components/Notice'
import Page from '../components/Page'

export default function Draw() {
  return (
    <Page
      title="The draw"
      intro="Won the month? Enter your code and see what is coming out of the workshop."
    >
      <Notice>Code entry opens once sign-in is ready.</Notice>
    </Page>
  )
}
