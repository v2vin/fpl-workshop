import type { SVGProps } from 'react'

export type IconName = 'table' | 'draw' | 'gifts' | 'cabinet' | 'about' | 'admin'

const paths: Record<IconName, string> = {
  table: 'M4 6h16M4 12h16M4 18h10',
  draw: 'M3 11h18v10H3zM12 11v10M3 11V8h18v3M12 8c-2-4-6-4-6-1s4 1 6 1zm0 0c2-4 6-4 6-1s-4 1-6 1z',
  gifts: 'M3 9h18v6H3zM7 9v6M17 9v6M3 12h18',
  cabinet:
    'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 21h6M10 17h4v4',
  about: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 8h.01',
  admin: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6zM9 12l2 2 4-4',
}

interface Props extends SVGProps<SVGSVGElement> {
  name: IconName
}

export default function Icon({ name, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  )
}
