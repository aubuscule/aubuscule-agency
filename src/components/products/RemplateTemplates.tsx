'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import '@/components/products/products.css'
import { DEVICES, PACKS, PackCard } from './RemplateData'

export function RemplateTemplates() {
  const t = useTranslations('remplate.templates')
  const [deviceId, setDeviceId] = useState<string>('rm2')
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  const downloadAll = () => {
    let i = 0
    PACKS.forEach(pack => {
      if (pack.type === 'single') {
        setTimeout(() => {
          const a = document.createElement('a')
          a.href = `/apps/remplate/templates/${deviceId}/${pack.file}`
          a.download = pack.file
          document.body.appendChild(a)
          a.click()
          a.remove()
        }, i++ * 200)
      } else {
        pack.files.forEach(f => {
          setTimeout(() => {
            const a = document.createElement('a')
            a.href = `/apps/remplate/templates/${deviceId}/${f.file}`
            a.download = f.file
            document.body.appendChild(a)
            a.click()
            a.remove()
          }, i++ * 200)
        })
      }
    })
  }

  return (
    <>
      <section className="app-hero" style={{ paddingBottom: 'var(--sp-8)' }}>
        <div className="app-hero-badge">
          <span className="app-hero-badge-dot" />
          <span className="app-hero-badge-text">{t('badge')}</span>
        </div>
        <h1 className="hero-h1" id="rmp-templates-heading">
          {t('title')}
        </h1>
        <p className="app-hero-lead">
          {t('lead')}
        </p>
      </section>

      <section className="app-templates" aria-label={t('chooseDevice')}>
        <div className="app-device-toggle-wrap">
          <span className="app-device-toggle-label">{t('chooseDevice')}</span>
          <div className="app-device-toggle" role="tablist">
            {DEVICES.map(d => (
              <button
                key={d.id}
                type="button"
                className={`app-device-btn${d.id === deviceId ? ' active' : ''}`}
                role="tab"
                aria-selected={d.id === deviceId}
                onClick={() => setDeviceId(d.id)}
              >
                {d.label}
                <span className="app-device-dim">{d.dims.split(' · ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="app-gallery">
          {PACKS.map(pack => (
            <PackCard
              key={pack.id}
              pack={pack}
              deviceId={deviceId}
              onPreview={setLightboxSrc}
            />
          ))}
        </div>

        <div className="app-pack-bar">
          <button type="button" className="btn-primary" onClick={downloadAll}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t('downloadAll')}
          </button>
        </div>
      </section>

      {/* ── Getting started CTA ── */}
      <section className="app-why" style={{ borderTop: '1px solid var(--hairline)', marginTop: 'var(--sp-16)' }}>
        <h2 className="app-why-h2" style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
          {t('howtoTitle')}
        </h2>
        <p className="app-why-lead">
          {t('howtoLead')}
        </p>
        <Link href="/products/remplate/faq" className="btn-primary" style={{ marginTop: 'var(--sp-4)' }}>
          {t('howtoButton')}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
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
          <img src={lightboxSrc} alt="" className="app-lightbox-img" />
        </div>
      )}
    </>
  )
}
