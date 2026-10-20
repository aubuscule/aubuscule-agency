"use client";

import { useLocale, useTranslations } from "next-intl";
import "@/components/products/products.css";

export function ZonesTonalesPage() {
  const t = useTranslations("zonesTonales");
  const locale = useLocale();

  const getImagePath = (baseName: string) => {
    if (locale === 'en') {
      if (baseName === 'zones-tonales-cover') return '/images/tonal-zones-cover-en.png';
      return `/images/${baseName}-en.png`;
    }
    if (locale === 'nl') {
      if (baseName === 'zones-tonales-cover') return '/images/tonale-zones-cover-nl.png';
      return `/images/${baseName}-nl.png`;
    }
    return `/images/${baseName}.png`;
  };

  return (
    <>
      <section
        className="app-hero"
        id="overview"
        aria-labelledby="zt-hero-heading"
        style={{ paddingBottom: "var(--sp-12)" }}
      >
        <div className="app-hero-badge">
          <span className="app-hero-badge-dot" />
          <span className="app-hero-badge-text">{t("hero.badge")}</span>
        </div>
        <h1
          className="hero-h1"
          id="zt-hero-heading"
          style={{ marginTop: "var(--sp-6)" }}
        >
          {t("hero.title")}
        </h1>
        <p className="app-hero-lead">{t("hero.lead")}</p>
        <div className="app-hero-actions">
          <a
            href="https://tr.ee/I9DqWD4RtT"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            {t("hero.buy")}
          </a>
        </div>

        <div
          className="app-hero-screenshot"
          style={{ marginTop: "var(--sp-12)" }}
        >
          <img
            src={getImagePath("zones-tonales-cover")}
            alt={t("hero.title")}
            className="app-screenshot-img"
          />
        </div>
      </section>

      {/* Features */}
      <section
        className="app-features"
        id="features"
        aria-labelledby="zt-features-heading"
      >
        <div className="app-section-header app-section-header--center">
          <span className="label">{t("previewTitle")}</span>
          <h2 className="app-section-h2" id="zt-features-heading">
            {t("featuresTitle")}
          </h2>
        </div>
        <ul className="app-features-grid" role="list">
          {[
            {
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              ),
              title: t("features.f1Title"),
              desc: t("features.f1Desc"),
            },
            {
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              ),
              title: t("features.f2Title"),
              desc: t("features.f2Desc"),
            },
            {
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                </svg>
              ),
              title: t("features.f3Title"),
              desc: t("features.f3Desc"),
            },
            {
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 00-4 0v2" />
                  <line x1="12" y1="12" x2="12" y2="16" />
                </svg>
              ),
              title: t("features.f4Title"),
              desc: t("features.f4Desc"),
            },
            {
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M3 9h18" />
                  <circle cx="7.5" cy="6" r="1" />
                  <circle cx="12" cy="6" r="1" />
                </svg>
              ),
              title: t("features.f5Title"),
              desc: t("features.f5Desc"),
            },
            {
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              ),
              title: t("features.f6Title"),
              desc: t("features.f6Desc"),
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

      {/* Pages Preview */}
      <section className="app-templates" id="preview">
        <div className="app-section-header app-section-header--center">
          <span className="label">{t("galleryLabel")}</span>
          <h2 className="app-section-h2">{t("previewTitle")}</h2>
        </div>

        <div className="app-gallery">
          <img
            src={getImagePath("zt-page-2")}
            alt="Page 2"
            style={{ width: "100%", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,.07)" }}
          />
          <img
            src={getImagePath("zt-page-4")}
            alt="Page 4"
            style={{ width: "100%", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,.07)" }}
          />
          <img
            src={getImagePath("zt-page-9")}
            alt="Page 9"
            style={{ width: "100%", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,.07)" }}
          />
        </div>
      </section>

      {/* ── Download CTA ── */}
      <section className="app-download" id="download" aria-labelledby="zt-download-heading">
        <div className="app-download-logo" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <polyline points="9 15 12 18 15 15" />
          </svg>
        </div>
        <h2 className="app-download-h2" id="zt-download-heading">{t("ctaTitle")}</h2>
        <p className="app-download-text">
          {t("ctaDesc")}
        </p>
        <div className="app-download-actions">
          <a
            href="https://tr.ee/I9DqWD4RtT"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            {t("hero.buy")}
          </a>
        </div>

        <div className="app-trust">
          {[
            { label: t("trust1") },
            { label: t("trust2") },
            { label: t("trust3") },
          ].map((item, i) => (
            <span key={i} className="app-trust-badge">
              {item.label}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
