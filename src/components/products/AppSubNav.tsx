'use client'

import { Link, usePathname } from '@/i18n/navigation'

interface SubNavItem {
  href: string
  label: string
}

interface AppSubNavProps {
  items: SubNavItem[]
}

export function AppSubNav({ items }: AppSubNavProps) {
  const pathname = usePathname()

  return (
    <nav className="app-subnav" aria-label="Page sections">
      <div className="app-subnav-inner">
        <ul className="app-subnav-links">
          {items.map(item => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-link${active ? ' nav-link--active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
