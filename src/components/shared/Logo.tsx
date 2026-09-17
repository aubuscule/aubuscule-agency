import { Link } from '@/i18n/navigation'
import { Mark } from './Mark'

interface LogoProps {
  idPrefix: string;
  className?: string;
  wordmarkClassName?: string;
  markStyle?: React.CSSProperties;
}

export function Logo({ idPrefix, className, wordmarkClassName, markStyle = { width: 32, height: 32, flexShrink: 0 } }: LogoProps) {
  const gradId = `${idPrefix}MarkGradient`
  
  return (
    <Link href="/" className={className}>
      <Mark idPrefix={idPrefix} inkColor={`url(#${gradId})`} style={markStyle}>
        <linearGradient id={gradId} x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
          <stop offset="0%" stopColor="var(--hero-accent-1)" />
          <stop offset="50%" stopColor="var(--hero-accent-2)" />
          <stop offset="100%" stopColor="var(--hero-accent-1)" />
          <animate attributeName="x1" values="0; 200" dur="8s" repeatCount="indefinite" />
          <animate attributeName="x2" values="200; 400" dur="8s" repeatCount="indefinite" />
        </linearGradient>
      </Mark>
      <span className={wordmarkClassName}>Aubuscule</span>
    </Link>
  )
}
