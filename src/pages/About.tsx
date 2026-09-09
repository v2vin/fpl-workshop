import Notice from '../components/Notice'
import Page from '../components/Page'
import { WORKSHOP_NAME } from '../lib/config'

export default function About() {
  return (
    <Page title="About" intro="How the league and the draw work.">
      <Notice>
        <p>
          Each month the manager with the most points wins a small piece of solid pine, made by hand
          at {WORKSHOP_NAME} in Malawi and photographed as it is built.
        </p>
        <p className="mt-3">
          The gift is chosen at random the moment the owner issues the winner’s code. The shuffle on
          the draw page is just for show, so reloading cannot change the result.
        </p>
      </Notice>
    </Page>
  )
}
