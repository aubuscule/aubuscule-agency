'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import '@/components/products/products.css'
import { FAQItem } from './RemplateData'

/* ── Device specs for the dimensions table ─────────────────────────── */

const DIMS_ROWS = [
  { id: 'rm2',  label: 'reMarkable 2',  portrait: '1404 × 1872', dpi: '226' },
  { id: 'pure', label: 'Paper Pure',    portrait: '1404 × 1872', dpi: '226' },
  { id: 'pp',   label: 'Paper Pro',     portrait: '1620 × 2160', dpi: '229' },
  { id: 'move', label: 'Paper Pro Move', portrait: '954 × 1696',  dpi: '264' },
]

/* ── FAQ groups ─────────────────────────────────────────────────────── */

const FAQ_GROUPS = [
  { labelKey: 'groupConnected', items: ['ip', 'connect', 'error'] as const, defaultOpen: ['ip'] as const },
  { labelKey: 'groupBasics',    items: ['dims', 'base'] as const },
  { labelKey: 'groupUsing',     items: ['add', 'remove'] as const },
]

type FaqId = 'ip' | 'connect' | 'error' | 'dims' | 'base' | 'add' | 'remove'

export function RemplateFAQ() {
  const t = useTranslations('remplate.faq')
  const tItems = useTranslations('remplate.faq.items')

  const [openFaqs, setOpenFaqs] = useState<Set<string>>(
    () => new Set(FAQ_GROUPS.flatMap(g => g.defaultOpen ?? []))
  )

  const toggleFaq = useCallback((id: string) => {
    setOpenFaqs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const mailtoSubject = encodeURIComponent(t('mailtoSubject'))
  const mailtoBody = encodeURIComponent(t('mailtoBody'))
  const mailtoHref = `mailto:contact@aubuscule.com?subject=${mailtoSubject}&body=${mailtoBody}`

  const renderAnswer = (id: FaqId) => {
    switch (id) {
      case 'ip':
        return (
          <>
            <p>{tItems('ip.a1')}</p>
            <p>{tItems('ip.a2')}</p>
          </>
        )
      case 'connect':
        return (
          <>
            <p>{tItems('connect.step1')}</p>
            <p>{tItems('connect.step2')}</p>
            <p>{tItems('connect.step3')}</p>
            <p><em>{tItems('connect.sshKey')}</em></p>
          </>
        )
      case 'error':
        return (
          <>
            <p>{tItems('error.check1')}</p>
            <p>{tItems('error.check2')}</p>
            <p>{tItems('error.check3')}</p>
          </>
        )
      case 'dims':
        return (
          <>
            <p>{tItems('dims.a')}</p>
            <table className="app-dim-table">
              <thead>
                <tr>
                  <th>{tItems('dims.device')}</th>
                  <th>{tItems('dims.portrait')}</th>
                  <th>{tItems('dims.dpi')}</th>
                </tr>
              </thead>
              <tbody>
                {DIMS_ROWS.map(row => (
                  <tr key={row.id}>
                    <td>{row.label}</td>
                    <td className="mono">{row.portrait}</td>
                    <td className="mono">{row.dpi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )
      case 'base':
        return (
          <>
            <p>{tItems('base.a1')}</p>
            <p>{tItems('base.a2')}</p>
          </>
        )
      case 'add':
        return (
          <>
            <p>{tItems('add.a1')}</p>
            <p>{tItems('add.a2')}</p>
          </>
        )
      case 'remove':
        return (
          <>
            <p>{tItems('remove.a1')}</p>
            <p>{tItems('remove.a2')}</p>
          </>
        )
      default:
        return null
    }
  }

  return (
    <>
      <section className="app-hero" style={{ paddingBottom: 'var(--sp-8)' }}>
        <div className="app-hero-badge">
          <span className="app-hero-badge-dot" />
          <span className="app-hero-badge-text">{t('badge')}</span>
        </div>
        <h1 className="hero-h1" id="rmp-faq-heading">
          {t('title')}
        </h1>
        <p className="app-hero-lead">
          {t('lead')}
        </p>
      </section>

      <section className="app-faq" aria-labelledby="rmp-faq-heading">
        {FAQ_GROUPS.map(group => (
          <div className="app-faq-group" key={group.labelKey}>
            <span className="label app-faq-group-label">{t(group.labelKey)}</span>
            {group.items.map(id => (
              <FAQItem
                key={id}
                question={tItems(`${id}.q`)}
                answer={renderAnswer(id)}
                open={openFaqs.has(id)}
                onToggle={() => toggleFaq(id)}
              />
            ))}
          </div>
        ))}
      </section>

      <section className="app-why" style={{ borderTop: '1px solid var(--hairline)', marginTop: 'var(--sp-16)', padding: 'var(--sp-12) 0', textAlign: 'center' }}>
        <div className="card" style={{ padding: 'var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', alignItems: 'center' }}>
          <h2 className="app-why-h2" style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 0 }}>
            {t('helpTitle')}
          </h2>
          <p className="app-why-lead" style={{ marginBottom: 0 }}>
            {t('helpLead')}
          </p>
          <a
            href={mailtoHref}
            className="btn-primary"
          >
            {t('helpButton')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 6l-10 7L2 6" />
            </svg>
          </a>
        </div>
      </section>
    </>
  )
}
