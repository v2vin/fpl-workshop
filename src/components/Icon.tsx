import type { SVGProps } from 'react'

export type IconName = 'table' | 'draw' | 'gifts' | 'cabinet' | 'about' | 'clock' | 'admin'

// Tab-bar icons from the design kit (assets/ui-icons), plus a shield for Admin.
const paths: Record<IconName, string> = {
  table: 'M4 5h16v15H4z M4 10h16 M10 5v15 M4 15h16',
  draw: 'M4 8h16v12H4z M3 5h18v4H3z M12 5v15 M12 5C4 6 6 0 9 2z M12 5c8 1 6-5 3-3z',
  gifts: 'M4 7h16v13H4z M3 4h18v4H3z M12 4v16',
  cabinet: 'M4 4h16v16H4z M4 12h16 M8 8h2 M14 16h2',
  about: 'M12 8v1 M12 12v5 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  clock: 'M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  admin: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6zM9 12l2 2 4-4',
}

interface Props extends SVGProps<SVGSVGElement> {
  name: IconName
}

export default function Icon({ name, strokeWidth = 1.7, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  )
}
