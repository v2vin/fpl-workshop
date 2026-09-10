import { Link } from 'react-router'
import Icon from '../components/Icon'

export default function NotFound() {
  return (
    <div className="px-4 py-10 text-center">
      <p className="eyebrow">404</p>
      <Icon name="table" className="mx-auto my-5 h-10 w-10 text-pine-600" />
      <h1 className="display text-[30px] leading-tight tracking-[-1.25px] text-pitch-900">
        Off the pitch
      </h1>
      <p className="mt-3 text-sm text-stone-600">
        That page isn’t here. Let’s get you back to the league.
      </p>
      <Link to="/" className="btn btn-primary mt-6">
        Back to the table
      </Link>
    </div>
  )
}
