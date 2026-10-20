'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import '@/components/products/products.css'

/* ── Flow arrow ───────────────────────────────────────────────────── */

function FlowArrow() {
  return (
    <div className="rmp-flow-arrow" aria-hidden="true">
      <svg width="46" height="16" viewBox="0 0 46 16" fill="none">
        <line x1="0" y1="8" x2="38" y2="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" strokeLinecap="round" />
        <path d="M38 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

/* ── Main overview page ───────────────────────────────────────────── */

/* ── Template Specs Constants ───────────────────────────────────────── */

const SPECS_DEVICES = [
  { id: 'rm2',  label: 'reMarkable2',  size: '10.3"', portrait: '1404 × 1872 px', landscape: '1872 × 1404 px', dpi: '226 DPI', labelDownload: 'REMARKABLE2' },
  { id: 'pure', label: 'Pure',         size: '10.3"', portrait: '1404 × 1872 px', landscape: '1872 × 1404 px', dpi: '226 DPI', labelDownload: 'PAPER PURE' },
  { id: 'pp',   label: 'Pro',          size: '11.8"', portrait: '1620 × 2160 px', landscape: '2160 × 1620 px', dpi: '229 DPI', labelDownload: 'PAPER PRO' },
  { id: 'move', label: 'Pro Move',     size: '7.3"',  portrait: '954 × 1696 px',  landscape: '1696 × 954 px',  dpi: '264 DPI', labelDownload: 'PAPER PRO MOVE' },
];

const TOOLS = [
  {
    label: 'Figma',
    url: 'https://www.figma.com/community/file/1642997709257924418',
    download: false,
    logo: (
      <svg width="13" height="13" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 28.5C19 25.9804 20.0009 23.5641 21.7825 21.7825C23.5641 20.0009 25.9804 19 28.5 19C31.0196 19 33.4359 20.0009 35.2175 21.7825C36.9991 23.5641 38 25.9804 38 28.5C38 31.0196 36.9991 33.4359 35.2175 35.2175C33.4359 36.9991 31.0196 38 28.5 38C25.9804 38 23.5641 36.9991 21.7825 35.2175C20.0009 33.4359 19 31.0196 19 28.5Z" fill="#1ABCFE"/>
        <path d="M0 47.5C0 44.9804 1.00089 42.5641 2.78249 40.7825C4.56408 39.0009 6.98044 38 9.5 38H19V47.5C19 50.0196 17.9991 52.4359 16.2175 54.2175C14.4359 55.9991 12.0196 57 9.5 57C6.98044 57 4.56408 55.9991 2.78249 54.2175C1.00089 52.4359 0 50.0196 0 47.5Z" fill="#0ACF83"/>
        <path d="M19 0V19H28.5C31.0196 19 33.4359 17.9991 35.2175 16.2175C36.9991 14.4359 38 12.0196 38 9.5C38 6.98044 36.9991 4.56408 35.2175 2.78249C33.4359 1.00089 31.0196 0 28.5 0H19Z" fill="#FF7262"/>
        <path d="M0 9.5C0 12.0196 1.00089 14.4359 2.78249 16.2175C4.56408 17.9991 6.98044 19 9.5 19H19V0H9.5C6.98044 0 4.56408 1.00089 2.78249 2.78249C1.00089 4.56408 0 6.98044 0 9.5Z" fill="#F24E1E"/>
        <path d="M0 28.5C0 31.0196 1.00089 33.4359 2.78249 35.2175C4.56408 36.9991 6.98044 38 9.5 38H19V19H9.5C6.98044 19 4.56408 20.0009 2.78249 21.7825C1.00089 23.5641 0 25.9804 0 28.5Z" fill="#A259FF"/>
      </svg>
    )
  },
  {
    label: 'Penpot',
    url: '/apps/remplate/base/Remplate-device-frames.penpot',
    download: true,
    logo: (
      <svg width="13" height="13" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M64 0L128 32V96L64 128L0 96V32L64 0Z" fill="#31EFB8"/>
        <path d="M64 16L112 40V88L64 112L16 88V40L64 16Z" fill="#0D0D0D"/>
        <path d="M64 32L96 48V80L64 96L32 80V48L64 32Z" fill="#31EFB8"/>
      </svg>
    )
  },
  {
    label: 'Affinity',
    url: '/apps/remplate/base/Remplate-device-frames.afdesign',
    download: true,
    logo: (
      <svg width="13" height="13" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="56" height="56" rx="12" fill="#1B2B7A"/>
        <path d="M28 8L46 40H10L28 8Z" fill="white" fillOpacity="0.9"/>
        <path d="M20 40L28 24L36 40H20Z" fill="#1B2B7A"/>
      </svg>
    )
  },
  {
    label: 'PNG',
    url: '/apps/remplate/base/Remplate-device-frames-png.zip',
    download: true,
    logo: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    )
  }
];

export function RemplatePage() {
  const t = useTranslations('remplate.overview')
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [specsDeviceId, setSpecsDeviceId] = useState<string>('rm2')

  return (
    <>
      {/* ── Hero ── */}
      <section className="app-hero" id="overview" aria-labelledby="rmp-hero-heading">
        <div className="app-hero-brand">
          <svg className="app-hero-logo" width="34" height="34" viewBox="21 17 144 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M60,35L60,141C60,141 61.072,156 44,156C26.928,156 26.891,138.891 26.891,138.891L26.891,80C26.891,80 27.932,58 51,58L87,58C87,58 112,63.881 112,85C112,106.119 95.697,115.57 79,117C62.303,118.43 51.313,110.85 44,104C36.687,97.15 40,88 40,88C40,88 42.652,82.412 50,83C57.348,83.588 63.69,86.889 77,106C90.31,125.111 98,136 98,136C98,136 113.082,156 127,156L149,156C149,156 159,156.003 159,146L159,61L122.499,23.499L71,24C71,24 60,25.395 60,35Z"
              stroke="currentColor"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M122.499,23.499L122.499,61L159,61L122.499,23.499Z"
              stroke="currentColor"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="app-hero-brand-name">Remplate</span>
        </div>
        <div className="app-hero-divider" aria-hidden="true" />
        <h1 className="hero-h1" id="rmp-hero-heading">
          {t('heroTagline')}
        </h1>
        <p className="app-hero-lead">
          {t('heroLead')}
        </p>
        <div className="app-hero-actions">
          <a
            href="https://gumroad.com/l/remplate"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            {t('heroGetMac')}
          </a>
          <a
            href="https://tally.so/r/A7yvQB"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            {t('heroNotified')}
          </a>
        </div>

        <div className="app-hero-flow">
          {/* LEFT — Your template */}
          <div className="rmp-flow-side">
            <div className="rmp-flow-sheet">
              <svg width="56" height="72" viewBox="0 0 56 72" style={{ opacity: 0.5 }}>
                {[12, 24, 36, 48, 60].map(y =>
                  [10, 22, 34, 46].map(x => (
                    <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill="currentColor" />
                  ))
                )}
              </svg>
              <span className="rmp-flow-sheet-tag">PNG</span>
            </div>
            <span className="rmp-flow-label">{t('flowYourTemplate')}</span>
          </div>

          <FlowArrow />

          {/* MIDDLE — Screenshot */}
          <div className="app-hero-screenshot" onClick={() => setLightboxSrc('/apps/remplate/screenshot.png')} style={{ cursor: 'zoom-in' }}>
            <img
              src="/apps/remplate/screenshot.png"
              alt={t('screenshotAlt')}
              className="app-screenshot-img"
            />
          </div>

          <FlowArrow />

          {/* RIGHT — Your reMarkable */}
          <div className="rmp-flow-side">
            <div className="rmp-flow-device">
              <div className="rmp-flow-device-screen">
                <svg width="100%" height="100%" viewBox="0 0 80 100" preserveAspectRatio="none" style={{ opacity: 0.55, position: 'absolute', inset: 0 }}>
                  {[16, 32, 48, 64, 80, 96].map(y =>
                    [12, 28, 44, 60, 76].map(x => (
                      <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" fill="currentColor" />
                    ))
                  )}
                </svg>
                <div className="rmp-flow-check">
                  <svg width="8" height="8" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div className="rmp-flow-device-btn" />
            </div>
            <span className="rmp-flow-label">{t('flowYourRemarkable')}</span>
          </div>
        </div>
      </section>

      {/* ── Why ── */}
      <section className="app-why" aria-labelledby="rmp-why-heading">
        <h2 className="app-why-h2" id="rmp-why-heading">
          {t('whyTitle')}
        </h2>
        <p className="app-why-lead">
          {t('whyLead')}
        </p>
      </section>

      {/* ── Features ── */}
      <section className="app-features" id="features" aria-labelledby="rmp-features-heading">
        <div className="app-section-header">
          <span className="label">{t('featuresEyebrow')}</span>
          <h2 className="app-section-h2" id="rmp-features-heading">
            {t('featuresTitle')}
          </h2>
        </div>
        <ul className="app-features-grid" role="list">
          {[
            {
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>,
              title: t('f1Title'),
              desc: t('f1Desc'),
            },
            {
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>,
              title: t('f2Title'),
              desc: t('f2Desc'),
            },
            {
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /></svg>,
              title: t('f3Title'),
              desc: t('f3Desc'),
            },
            {
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-4 0v2" /><line x1="12" y1="12" x2="12" y2="16" /></svg>,
              title: t('f4Title'),
              desc: t('f4Desc'),
            },
            {
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18" /><circle cx="7.5" cy="6" r="1" /><circle cx="12" cy="6" r="1" /></svg>,
              title: t('f5Title'),
              desc: t('f5Desc'),
            },
            {
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
              title: t('f6Title'),
              desc: t('f6Desc'),
            },
          ].map((f, i) => (
            <li key={i} className="card app-feature-card">
              <div className="app-feature-icon" aria-hidden="true">
                {f.icon}
              </div>
              <h3 className="app-feature-title">{f.title}</h3>
              <p className="app-feature-desc">{f.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Specs ── */}
      <section className="app-specs" id="specs" aria-labelledby="rmp-specs-heading">
        <div className="app-specs-info">
          <span className="label">{t('specsEyebrow')}</span>
          <h2 className="app-specs-title" id="rmp-specs-heading">
            {t('specsTitle')}
          </h2>
          <p className="app-specs-desc">
            {t('specsDesc')}
          </p>
          <Link href="/products/remplate/templates" className="app-specs-link">
            {t('specsLink')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginLeft: '4px' }}>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        <div className="app-specs-card">
          {/* Mobile select dropdown */}
          <div className="app-specs-mobile-select-wrap">
            <span className="app-specs-footer-label" style={{ marginBottom: '8px' }}>{t('specsLabel')}</span>
            <div className="app-specs-select-container">
              <select
                value={specsDeviceId}
                onChange={(e) => setSpecsDeviceId(e.target.value)}
                className="app-specs-select"
              >
                {SPECS_DEVICES.map(d => (
                  <option key={d.id} value={d.id}>{d.label} — {d.size}</option>
                ))}
              </select>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="app-specs-select-chevron" aria-hidden="true">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>

          {/* Tab bar (desktop) */}
          <div className="app-specs-tabs" role="tablist">
            {SPECS_DEVICES.map(d => {
              const active = d.id === specsDeviceId;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSpecsDeviceId(d.id)}
                  className={`app-specs-tab${active ? ' active' : ''}`}
                  role="tab"
                  aria-selected={active}
                >
                  <span className="app-specs-tab-name">{d.label}</span>
                  <span className="app-specs-tab-sub">{d.size}</span>
                </button>
              )
            })}
          </div>

          {/* Specs body */}
          <div className="app-specs-body">
            <div className="app-specs-row">
              <span className="app-specs-row-label">{t('specsPortrait')}</span>
              <span className="app-specs-row-value">
                {SPECS_DEVICES.find(d => d.id === specsDeviceId)?.portrait}
              </span>
            </div>
            <div className="app-specs-row">
              <span className="app-specs-row-label">{t('specsLandscape')}</span>
              <span className="app-specs-row-value">
                {SPECS_DEVICES.find(d => d.id === specsDeviceId)?.landscape}
              </span>
            </div>
            <div className="app-specs-row">
              <span className="app-specs-row-label">{t('specsResolution')}</span>
              <span className="app-specs-row-value">
                {SPECS_DEVICES.find(d => d.id === specsDeviceId)?.dpi}
              </span>
            </div>
          </div>

          {/* Download base template footer */}
          <div className="app-specs-footer">
            <span className="app-specs-footer-label">
              {t('specsDownloadBase', { deviceName: SPECS_DEVICES.find(d => d.id === specsDeviceId)!.labelDownload })}
            </span>
            <div className="app-specs-buttons">
              {TOOLS.map(tool => (
                <a
                  key={tool.label}
                  href={tool.url}
                  className="btn-spec-download"
                  download={tool.download}
                  target={!tool.download ? '_blank' : undefined}
                  rel={!tool.download ? 'noopener noreferrer' : undefined}
                >
                  {tool.logo}
                  <span>{tool.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Download ── */}
      <section className="app-download" id="download" aria-labelledby="rmp-download-heading">
        <div className="app-download-logo" aria-hidden="true">
          <svg width="40" height="40" viewBox="21 17 144 145" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M60,35L60,141C60,141 61.072,156 44,156C26.928,156 26.891,138.891 26.891,138.891L26.891,80C26.891,80 27.932,58 51,58L87,58C87,58 112,63.881 112,85C112,106.119 95.697,115.57 79,117C62.303,118.43 51.313,110.85 44,104C36.687,97.15 40,88 40,88C40,88 42.652,82.412 50,83C57.348,83.588 63.69,86.889 77,106C90.31,125.111 98,136 98,136C98,136 113.082,156 127,156L149,156C149,156 159,156.003 159,146L159,61L122.499,23.499L71,24C71,24 60,25.395 60,35Z"
              stroke="currentColor"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M122.499,23.499L122.499,61L159,61L122.499,23.499Z"
              stroke="currentColor"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <h2 className="app-download-h2" id="rmp-download-heading">{t('ctaGetTitle')}</h2>
        <p className="app-download-text">
          {t('ctaGetDesc')}
        </p>
        <div className="app-download-actions">
          <a
            href="https://gumroad.com/l/remplate"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            {t('ctaGetButton')}
          </a>
          <a
            href="https://tally.so/r/A7yvQB"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            {t('heroNotified')}
          </a>
        </div>

        <div className="app-trust">
          {[
            { label: t('featureOneTime') },
            { label: t('featureNoSub') },
            { label: t('featureUpdates') },
          ].map((item, i) => (
            <span key={i} className="app-trust-badge">
              {item.label}
            </span>
          ))}
        </div>

        <div className="card app-disclaimer">
          <span className="label">{t('disclaimerTitle')}</span>
          <p>
            {t('disclaimerDesc')}
          </p>
        </div>
      </section>

      {/* ── Lightbox ── */}
      {lightboxSrc && (
        <div
          className="app-lightbox open"
          onClick={() => setLightboxSrc(null)}
          role="dialog"
          aria-modal="true"
          aria-label={t('lightboxLabel')}
        >
          <button
            type="button"
            className="app-lightbox-close"
            onClick={() => setLightboxSrc(null)}
            aria-label={t('lightboxClose')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img src={lightboxSrc} alt="Preview" className="app-lightbox-img" />
        </div>
      )}
    </>
  )
}
