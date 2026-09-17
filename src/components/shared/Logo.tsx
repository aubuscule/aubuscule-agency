import { useId } from 'react'
import { Link } from '@/i18n/navigation'
import { Mark } from './Mark'

interface LogoProps {
  inverted?: boolean;
}

export function Logo({ inverted = false }: LogoProps) {
  const rawId = useId()
  const idPrefix = 'l' + rawId.replace(/[^a-zA-Z0-9]/g, '')
  const gradId = `${idPrefix}Grad`
  
  return (
    <Link href="/" className={`logo ${inverted ? 'logo--inverted' : ''}`}>
      <Mark idPrefix={idPrefix} inkColor={`url(#${gradId})`} className="logo-mark-svg">
        <linearGradient id={gradId} x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
          <stop offset="0%" stopColor="var(--hero-accent-1)" />
          <stop offset="50%" stopColor="var(--hero-accent-2)" />
          <stop offset="100%" stopColor="var(--hero-accent-1)" />
          <animate attributeName="x1" values="0; 200" dur="8s" repeatCount="indefinite" />
          <animate attributeName="x2" values="200; 400" dur="8s" repeatCount="indefinite" />
        </linearGradient>
      </Mark>
      <span className="logo-wordmark">Aubuscule</span>
    </Link>
  )
}
