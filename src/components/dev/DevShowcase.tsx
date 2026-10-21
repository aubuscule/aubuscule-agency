import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

const PROJECT_KEYS = [
  'aubuscores',
  'remplate',
  'tourPlanner',
  'einkPlanner',
  'epks',
  'harmony',
] as const

function AubuscoresVisual() {
  return (
    <svg width="240" height="130" viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Dual Page Spread Background */}
      <rect x="25" y="15" width="90" height="100" rx="2" fill="var(--surface)" stroke="var(--hairline)" strokeWidth="1" />
      <rect x="125" y="15" width="90" height="100" rx="2" fill="var(--surface)" stroke="var(--hairline)" strokeWidth="1" />
      {/* Spine divider */}
      <line x1="120" y1="12" x2="120" y2="118" stroke="var(--ink-mute)" strokeWidth="1" strokeDasharray="3 3" />
      {/* Staves Left */}
      <line x1="35" y1="35" x2="105" y2="35" stroke="var(--ink-soft)" strokeWidth="0.8" />
      <line x1="35" y1="41" x2="105" y2="41" stroke="var(--ink-soft)" strokeWidth="0.8" />
      <line x1="35" y1="47" x2="105" y2="47" stroke="var(--ink-soft)" strokeWidth="0.8" />
      <line x1="35" y1="53" x2="105" y2="53" stroke="var(--ink-soft)" strokeWidth="0.8" />
      <line x1="35" y1="59" x2="105" y2="59" stroke="var(--ink-soft)" strokeWidth="0.8" />
      {/* Notes Left */}
      <circle cx="48" cy="47" r="3" fill="var(--accent)" />
      <line x1="51" y1="47" x2="51" y2="30" stroke="var(--accent)" strokeWidth="1.2" />
      <circle cx="68" cy="41" r="3" fill="var(--accent)" />
      <line x1="71" y1="41" x2="71" y2="26" stroke="var(--accent)" strokeWidth="1.2" />
      <circle cx="88" cy="35" r="3" fill="var(--accent)" />
      <line x1="91" y1="35" x2="91" y2="20" stroke="var(--accent)" strokeWidth="1.2" />
      {/* Staves Right */}
      <line x1="135" y1="35" x2="205" y2="35" stroke="var(--ink-soft)" strokeWidth="0.8" />
      <line x1="135" y1="41" x2="205" y2="41" stroke="var(--ink-soft)" strokeWidth="0.8" />
      <line x1="135" y1="47" x2="205" y2="47" stroke="var(--ink-soft)" strokeWidth="0.8" />
      <line x1="135" y1="53" x2="205" y2="53" stroke="var(--ink-soft)" strokeWidth="0.8" />
      <line x1="135" y1="59" x2="205" y2="59" stroke="var(--ink-soft)" strokeWidth="0.8" />
      {/* Lower Staves Right */}
      <line x1="135" y1="75" x2="205" y2="75" stroke="var(--hairline)" strokeWidth="0.8" />
      <line x1="135" y1="81" x2="205" y2="81" stroke="var(--hairline)" strokeWidth="0.8" />
      <line x1="135" y1="87" x2="205" y2="87" stroke="var(--hairline)" strokeWidth="0.8" />
      {/* Pedal Indicator */}
      <rect x="75" y="92" width="22" height="14" rx="2" fill="var(--accent)" />
      <text x="86" y="102" fill="var(--accent-fg)" fontSize="7" fontFamily="var(--font-jetbrains-mono)" textAnchor="middle">PED</text>
      <path d="M102 99 L114 99 M111 96 L114 99 L111 102" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RemplateVisual() {
  return (
    <svg width="240" height="130" viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Laptop / Mac preview */}
      <rect x="30" y="25" width="80" height="52" rx="3" fill="var(--surface)" stroke="var(--hairline)" strokeWidth="1.2" />
      <line x1="22" y1="77" x2="118" y2="77" stroke="var(--ink-mute)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Terminal prompt on screen */}
      <text x="36" y="40" fill="var(--accent)" fontSize="8" fontFamily="var(--font-jetbrains-mono)">ssh reMarkable</text>
      <rect x="36" y="46" width="30" height="4" rx="1" fill="var(--hairline)" />
      <rect x="36" y="54" width="48" height="4" rx="1" fill="var(--hairline)" />
      {/* Wireless SSH arrow */}
      <path d="M122 51 C132 45, 142 45, 152 51" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" />
      <polygon points="152,51 146,48 147,54" fill="var(--accent)" />
      {/* reMarkable tablet */}
      <rect x="160" y="18" width="55" height="78" rx="3" fill="var(--surface)" stroke="var(--ink-soft)" strokeWidth="1.5" />
      <rect x="166" y="24" width="43" height="66" rx="1" fill="color-mix(in srgb, var(--bg) 60%, transparent)" />
      {/* Template grid on tablet */}
      <circle cx="174" cy="34" r="1.5" fill="var(--accent)" />
      <circle cx="184" cy="34" r="1.5" fill="var(--accent)" />
      <circle cx="194" cy="34" r="1.5" fill="var(--accent)" />
      <circle cx="174" cy="44" r="1.5" fill="var(--accent)" />
      <circle cx="184" cy="44" r="1.5" fill="var(--accent)" />
      <circle cx="194" cy="44" r="1.5" fill="var(--accent)" />
      <circle cx="174" cy="54" r="1.5" fill="var(--accent)" />
      <circle cx="184" cy="54" r="1.5" fill="var(--accent)" />
      <circle cx="194" cy="54" r="1.5" fill="var(--accent)" />
      <text x="187.5" y="106" fill="var(--ink-soft)" fontSize="8" fontFamily="var(--font-jetbrains-mono)" textAnchor="middle">reMarkable 2 & Pro</text>
    </svg>
  )
}

function TourPlannerVisual() {
  return (
    <svg width="240" height="130" viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Background Geo Grid */}
      <line x1="20" y1="35" x2="220" y2="35" stroke="var(--hairline)" strokeWidth="0.6" strokeDasharray="4 4" />
      <line x1="20" y1="65" x2="220" y2="65" stroke="var(--hairline)" strokeWidth="0.6" strokeDasharray="4 4" />
      <line x1="20" y1="95" x2="220" y2="95" stroke="var(--hairline)" strokeWidth="0.6" strokeDasharray="4 4" />
      {/* 50km Radius Buffer Zone */}
      <path d="M45,75 Q90,30 145,55 T205,80" stroke="var(--accent)" strokeWidth="24" strokeOpacity="0.12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Outer Exclusion Zone Ring */}
      <circle cx="145" cy="55" r="32" stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4" />
      <circle cx="145" cy="55" r="16" stroke="var(--ink-mute)" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.4" fill="color-mix(in srgb, var(--surface) 40%, transparent)" />
      {/* Polyline Route */}
      <path d="M45,75 Q90,30 145,55 T205,80" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Waypoint 1 (Brussels) */}
      <circle cx="45" cy="75" r="5" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
      <text x="45" y="93" fill="var(--ink-soft)" fontSize="7" fontFamily="var(--font-jetbrains-mono)" textAnchor="middle">Départ</text>
      {/* Waypoint 2 (Stage) */}
      <circle cx="145" cy="55" r="5" fill="var(--accent)" stroke="var(--surface)" strokeWidth="1.5" />
      <text x="145" y="38" fill="var(--accent)" fontSize="8" fontFamily="var(--font-jetbrains-mono)" textAnchor="middle">50km Buffer</text>
      {/* Waypoint 3 (Arrival) */}
      <circle cx="205" cy="80" r="5" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
      <text x="205" y="98" fill="var(--ink-soft)" fontSize="7" fontFamily="var(--font-jetbrains-mono)" textAnchor="middle">Étape</text>
      {/* Matched Venue Pins */}
      <circle cx="120" cy="46" r="2.5" fill="var(--ink)" />
      <circle cx="160" cy="68" r="2.5" fill="var(--ink)" />
    </svg>
  )
}

function EinkPlannerVisual() {
  return (
    <svg width="240" height="130" viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* E-Ink Tablet Bezel */}
      <rect x="40" y="12" width="160" height="106" rx="4" fill="var(--surface)" stroke="var(--ink-soft)" strokeWidth="1.5" />
      {/* Left Sidebar Navigation Tabs */}
      <rect x="40" y="12" width="24" height="106" rx="3" fill="color-mix(in srgb, var(--bg) 70%, transparent)" stroke="var(--hairline)" strokeWidth="0.8" />
      <text x="52" y="28" fill="var(--ink)" fontSize="6" fontFamily="var(--font-jetbrains-mono)" textAnchor="middle">2026</text>
      <text x="52" y="44" fill="var(--accent)" fontSize="6" fontFamily="var(--font-jetbrains-mono)" textAnchor="middle">OCT</text>
      <text x="52" y="60" fill="var(--ink-soft)" fontSize="6" fontFamily="var(--font-jetbrains-mono)" textAnchor="middle">W42</text>
      <text x="52" y="76" fill="var(--ink-soft)" fontSize="6" fontFamily="var(--font-jetbrains-mono)" textAnchor="middle">NOTE</text>
      {/* Header bar with Day Title */}
      <text x="74" y="30" fill="var(--ink)" fontSize="9" fontWeight="600" fontFamily="var(--font-space-grotesk)">Mercredi 21 Octobre</text>
      <line x1="74" y1="36" x2="190" y2="36" stroke="var(--hairline)" strokeWidth="0.8" />
      {/* Dot Grid Canvas */}
      {[50, 64, 78, 92].map((y) => (
        <g key={y}>
          {[80, 95, 110, 125, 140, 155, 170, 185].map((x) => (
            <circle key={x} cx={x} cy={y} r="0.8" fill="var(--ink-mute)" />
          ))}
        </g>
      ))}
      {/* Hyperlink mesh indicator */}
      <path d="M150 96 L186 96 M180 93 L186 96 L180 99" stroke="var(--accent)" strokeWidth="1" strokeLinecap="round" />
      <text x="145" y="98" fill="var(--accent)" fontSize="6.5" fontFamily="var(--font-jetbrains-mono)" textAnchor="end">LINK MESH</text>
    </svg>
  )
}

function EpksVisual() {
  return (
    <svg width="240" height="130" viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Cloudflare Edge Network */}
      <ellipse cx="120" cy="65" rx="90" ry="45" stroke="var(--hairline)" strokeWidth="1" strokeDasharray="3 3" />
      {/* Central Edge Worker Hub */}
      <circle cx="120" cy="65" r="24" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.5" />
      <text x="120" y="62" fill="var(--accent)" fontSize="8" fontWeight="600" fontFamily="var(--font-jetbrains-mono)" textAnchor="middle">WORKER</text>
      <text x="120" y="72" fill="var(--ink-mute)" fontSize="6" fontFamily="var(--font-jetbrains-mono)" textAnchor="middle">&lt; 50ms</text>
      {/* Distributed Tenants */}
      <circle cx="50" cy="45" r="14" fill="var(--surface)" stroke="var(--ink-soft)" strokeWidth="1" />
      <text x="50" y="47" fill="var(--ink)" fontSize="6" fontFamily="var(--font-jetbrains-mono)" textAnchor="middle">shale</text>
      <line x1="64" y1="49" x2="98" y2="59" stroke="var(--accent)" strokeWidth="1" strokeDasharray="2 2" />

      <circle cx="190" cy="45" r="14" fill="var(--surface)" stroke="var(--ink-soft)" strokeWidth="1" />
      <text x="190" y="47" fill="var(--ink)" fontSize="6" fontFamily="var(--font-jetbrains-mono)" textAnchor="middle">artist-b</text>
      <line x1="176" y1="49" x2="142" y2="59" stroke="var(--accent)" strokeWidth="1" strokeDasharray="2 2" />

      <circle cx="70" cy="95" r="13" fill="var(--surface)" stroke="var(--ink-soft)" strokeWidth="1" />
      <text x="70" y="97" fill="var(--ink)" fontSize="5.5" fontFamily="var(--font-jetbrains-mono)" textAnchor="middle">catalog</text>
      <line x1="82" y1="89" x2="102" y2="77" stroke="var(--accent)" strokeWidth="1" strokeDasharray="2 2" />

      <circle cx="170" cy="95" r="13" fill="var(--surface)" stroke="var(--ink-soft)" strokeWidth="1" />
      <text x="170" y="97" fill="var(--ink)" fontSize="5.5" fontFamily="var(--font-jetbrains-mono)" textAnchor="middle">epk.pub</text>
      <line x1="158" y1="89" x2="138" y2="77" stroke="var(--accent)" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  )
}

function HarmonyVisual() {
  return (
    <svg width="240" height="130" viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Chromatic Circle & Harmonic Sectors */}
      <circle cx="120" cy="65" r="48" stroke="var(--hairline)" strokeWidth="1.2" />
      <circle cx="120" cy="65" r="24" stroke="var(--hairline-soft)" strokeWidth="0.8" />
      {/* Tonal Axis */}
      <line x1="120" y1="12" x2="120" y2="118" stroke="var(--hairline)" strokeWidth="0.8" strokeDasharray="2 2" />
      <line x1="67" y1="65" x2="173" y2="65" stroke="var(--hairline)" strokeWidth="0.8" strokeDasharray="2 2" />
      {/* Chord Matrix Sectors */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
        const rad = (angle * Math.PI) / 180
        const x = 120 + 48 * Math.cos(rad)
        const y = 65 + 48 * Math.sin(rad)
        return (
          <circle
            key={angle}
            cx={x}
            cy={y}
            r={angle % 90 === 0 ? '3.5' : '2'}
            fill={angle % 90 === 0 ? 'var(--accent)' : 'var(--ink-soft)'}
          />
        )
      })}
      {/* Major / Minor Triangle Modulation Vector */}
      <polygon points="120,25 156,85 84,85" stroke="var(--accent)" strokeWidth="1.5" fill="var(--accent)" fillOpacity="0.08" />
      <text x="120" y="69" fill="var(--ink)" fontSize="8" fontWeight="600" fontFamily="var(--font-jetbrains-mono)" textAnchor="middle">I - IV - V</text>
    </svg>
  )
}

const VISUAL_COMPONENTS = {
  aubuscores: AubuscoresVisual,
  remplate: RemplateVisual,
  tourPlanner: TourPlannerVisual,
  einkPlanner: EinkPlannerVisual,
  epks: EpksVisual,
  harmony: HarmonyVisual,
} as const

export function DevShowcase() {
  const t = useTranslations('dev.showcase')

  return (
    <section className="dev-section" id="realisations" aria-labelledby="dev-showcase-heading">
      <div className="dev-section-header">
        <p className="eyebrow">{t('eyebrow')}</p>
        <h2 className="dev-section-h2" id="dev-showcase-heading">
          {t('h2')}
        </h2>
        <p className="dev-section-lead">{t('lead')}</p>
      </div>

      <ul className="dev-showcase-grid" role="list">
        {PROJECT_KEYS.map((key) => {
          const Visual = VISUAL_COMPONENTS[key]
          const isExternal = t(`items.${key}.external`) === 'true' || key === 'aubuscores' || key === 'tourPlanner' || key === 'einkPlanner' || key === 'epks'
          const linkHref = t(`items.${key}.linkHref`)
          const linkText = t(`items.${key}.linkText`)

          return (
            <li key={key} className="dev-project-card">
              <div className="dev-project-visual">
                <Visual />
              </div>

              <div className="dev-project-body">
                <div className="dev-project-meta">
                  <span className="dev-project-type" aria-hidden="true">
                    {t(`items.${key}.num`)} · {t(`items.${key}.type`)}
                  </span>
                </div>

                <h3 className="dev-project-title">{t(`items.${key}.title`)}</h3>
                <p className="dev-project-summary">{t(`items.${key}.summary`)}</p>

                <p className="dev-project-highlight">
                  <strong>Points clés :</strong> {t(`items.${key}.highlight`)}
                </p>

                <div className="dev-project-footer">
                  {isExternal ? (
                    <a
                      href={linkHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dev-project-link"
                    >
                      {linkText}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  ) : (
                    <Link href={linkHref} className="dev-project-link">
                      {linkText}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
