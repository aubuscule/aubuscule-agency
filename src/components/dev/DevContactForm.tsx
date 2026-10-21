'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Select } from '@/components/shared/Select'

export function DevContactForm() {
  const t = useTranslations('dev.contact.form')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)
  const [projectType, setProjectType] = useState('desktop')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const nom = String(data.get('nom') ?? '')
    const email = String(data.get('email') ?? '')
    const typeValue = projectType
    const message = String(data.get('message') ?? '')

    const typeLabel = t(`typeOptions.${typeValue as 'desktop' | 'web' | 'automation' | 'document' | 'audit'}`)
    const subject = `Projet Ingénierie & Automatisation — ${nom || 'sans nom'}`
    const body = [
      `${t('nameLabel')} : ${nom}`,
      `${t('emailLabel')} : ${email}`,
      `${t('typeLabel')} : ${typeLabel}`,
      '',
      message,
    ].join('\n')

    try {
      window.location.href = `mailto:contact@aubuscule.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`
      setSent(true)
    } catch {
      setError(true)
    }
  }

  if (sent) {
    return (
      <div className="card form-success" role="status">
        <svg className="form-success-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="23" stroke="currentColor" strokeWidth="2" />
          <polyline points="14,25 21,32 34,17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="form-success-title">{t('successTitle')}</p>
        <p className="form-success-sub">{t('successSub')}</p>
      </div>
    )
  }

  const typeOptions = [
    { value: 'desktop', label: t('typeOptions.desktop') },
    { value: 'web', label: t('typeOptions.web') },
    { value: 'automation', label: t('typeOptions.automation') },
    { value: 'document', label: t('typeOptions.document') },
    { value: 'audit', label: t('typeOptions.audit') },
  ]

  return (
    <form className="card dev-contact-form" id="contact-form" onSubmit={handleSubmit}>
      <div className="dev-form-row">
        <label className="dev-form-field">
          <span className="label-sm dev-form-label">{t('nameLabel')}</span>
          <input
            className="dev-form-input"
            type="text"
            name="nom"
            required
            autoComplete="name"
          />
        </label>
        <label className="dev-form-field">
          <span className="label-sm dev-form-label">{t('emailLabel')}</span>
          <input
            className="dev-form-input"
            type="email"
            name="email"
            required
            autoComplete="email"
          />
        </label>
      </div>

      <div className="dev-form-field">
        <span className="label-sm dev-form-label">{t('typeLabel')}</span>
        <Select
          value={projectType}
          onChange={setProjectType}
          options={typeOptions}
          aria-label={t('typeLabel')}
        />
        <input type="hidden" name="type" value={projectType} />
      </div>

      <label className="dev-form-field">
        <span className="label-sm dev-form-label">{t('messageLabel')}</span>
        <textarea
          className="dev-form-textarea"
          name="message"
          rows={4}
          required
          placeholder={t('messagePlaceholder')}
        />
      </label>

      {error && (
        <p className="form-error" role="alert">
          Impossible d'ouvrir votre messagerie. Écrivez-nous à contact@aubuscule.com.
        </p>
      )}

      <div className="dev-form-footer">
        <p className="dev-form-notice">{t('notice')}</p>
        <button type="submit" className="dev-form-submit">
          {t('submit')}
        </button>
      </div>
    </form>
  )
}
