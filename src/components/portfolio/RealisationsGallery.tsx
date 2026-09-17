import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import "@/components/portfolio/portfolio.css";

export function RealisationsGallery() {
  const t = useTranslations("portfolio");

  return (
    <>
      <section className="apps-hero" aria-labelledby="apps-hero-heading">
        <h1 className="hero-h1" id="apps-hero-heading">
          {t("heroTitle")}
        </h1>
        <p className="apps-hero-lead">{t("heroLead")}</p>
      </section>

      <section className="apps-section" aria-labelledby="apps-list-heading">
        <h2 className="visually-hidden" id="apps-list-heading">
          {t("listHeading")}
        </h2>

        <ul className="apps-grid" role="list">
          <li>
            <article className="app-card">
              <div className="app-card-visual">
                <svg
                  width="80"
                  height="80"
                  viewBox="21 17 144 145"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M60,35L60,141C60,141 61.072,156 44,156C26.928,156 26.891,138.891 26.891,138.891L26.891,80C26.891,80 27.932,58 51,58L87,58C87,58 112,63.881 112,85C112,106.119 95.697,115.57 79,117C62.303,118.43 51.313,110.85 44,104C36.687,97.15 40,88 40,88C40,88 42.652,82.412 50,83C57.348,83.588 63.69,86.889 77,106C90.31,125.111 98,136 98,136C98,136 113.082,156 127,156L149,156C149,156 159,156.003 159,146L159,61L122.499,23.499L71,24C71,24 60,25.395 60,35Z"
                    stroke="var(--accent)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <path
                    d="M122.499,23.499L122.499,61L159,61L122.499,23.499Z"
                    stroke="var(--accent)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              <div className="app-card-body">
                <div className="app-card-header">
                  <h3 className="app-card-title">Remplate</h3>
                  <span className="app-card-price">15 €</span>
                </div>
                <p className="app-card-desc">{t("cardDesc")}</p>
                <ul className="app-card-tags" aria-label="Tags">
                  <li className="app-card-tag">{t("cardTagDesktop")}</li>
                </ul>
                <div className="app-card-footer">
                  <Link href="/portfolio/remplate" className="app-card-btn">
                    {t("cardLearnMore")}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                  <a
                    href="https://gumroad.com/l/remplate"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="app-card-btn-secondary"
                  >
                    {t("cardBuy")}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          </li>
          <li>
            <article className="app-card">
              <div className="app-card-visual">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
                    (angle) => (
                      <circle
                        key={angle}
                        cx="100"
                        cy="45"
                        r="45"
                        fill="var(--accent)"
                        fillOpacity="0.2"
                        style={{ mixBlendMode: 'screen' }}
                        transform={`rotate(${angle} 100 100)`}
                      />
                    )
                  )}
                </svg>
              </div>
              <div className="app-card-body">
                <div className="app-card-header">
                  <h3 className="app-card-title">{t("ztCardTitle")}</h3>
                  <span className="app-card-price">29 €</span>
                </div>
                <p className="app-card-desc">{t("ztCardDesc")}</p>
                <ul className="app-card-tags" aria-label="Tags">
                  <li className="app-card-tag">{t("ztCardTag")}</li>
                </ul>
                <div className="app-card-footer">
                  <Link
                    href="/portfolio/zones-tonales"
                    className="app-card-btn"
                  >
                    {t("cardLearnMore")}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                  <a
                    href="#" // The user didn't specify a link yet, just a CTA
                    target="_blank"
                    rel="noopener noreferrer"
                    className="app-card-btn-secondary"
                  >
                    {t("cardBuy")}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          </li>
        </ul>
      </section>

      <section className="apps-cta" aria-labelledby="apps-cta-heading">
        <h2 className="apps-cta-h2" id="apps-cta-heading">
          {t("ctaTitle")}
        </h2>
        <p className="apps-cta-text">{t("ctaText")}</p>
        <a
          href="mailto:contact@aubuscule.com?subject=Proposition%20d'application"
          className="btn-primary apps-cta-btn"
        >
          {t("ctaButton")}
        </a>
      </section>
    </>
  );
}
