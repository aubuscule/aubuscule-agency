import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import "@/components/products/products.css";

export function ProductsGallery() {
  const t = useTranslations("products");

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
                  <Link href="/products/remplate" className="app-card-btn">
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
                  viewBox="106 134 300 300"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M289.0 173.8 L287.5 173.6 L286.0 173.8 L284.5 174.2 L283.2 175.0 L282.1 176.1 L281.3 177.2 L280.7 178.6 L280.4 180.1 L280.4 313.3 L280.2 316.1 L279.5 318.7 L278.2 321.4 L276.6 323.7 L274.4 325.8 L271.8 327.5 L270.3 328.2 L268.5 328.8 L262.7 329.7 L259.5 330.4 L255.4 331.5 L251.4 332.9 L247.4 334.6 L243.5 336.5 L239.9 338.7 L236.4 341.2 L233.3 343.8 L230.4 346.5 L227.8 349.4 L225.5 352.4 L223.6 355.6 L222.3 358.3 L221.0 361.4 L220.2 364.5 L219.8 367.1 L219.6 369.6 L219.7 372.0 L220.1 374.6 L220.7 377.0 L221.5 379.1 L222.6 381.3 L223.9 383.3 L225.7 385.4 L227.4 387.1 L229.4 388.7 L231.6 390.1 L233.9 391.4 L236.8 392.6 L239.5 393.5 L242.2 394.2 L246.2 394.8 L250.9 395.1 L255.2 395.0 L260.2 394.5 L264.5 393.6 L269.5 392.2 L274.5 390.4 L278.6 388.5 L282.4 386.4 L286.6 383.5 L290.0 380.9 L293.6 377.5 L296.2 374.6 L298.5 371.5 L300.4 368.4 L302.2 364.9 L303.5 362.9 L304.2 361.3 L304.4 359.5 L304.4 275.3 L304.5 273.4 L305.0 271.1 L305.8 268.9 L306.9 266.8 L308.2 264.9 L309.9 263.3 L311.7 261.9 L313.8 260.7 L316.0 259.9 L318.0 259.5 L320.2 259.3 L322.3 259.4 L324.6 259.9 L326.4 260.5 L328.4 261.5 L329.8 262.4 L332.5 264.4 L337.1 268.2 L341.3 272.0 L343.8 274.5 L348.0 278.9 L351.7 283.2 L355.5 288.0 L357.5 290.8 L360.9 295.8 L365.4 303.7 L369.3 311.6 L371.8 317.6 L374.7 326.2 L377.0 335.0 L378.7 344.0 L379.7 353.1 L380.1 363.8 L380.4 364.9 L381.0 366.1 L381.8 367.1 L382.6 367.9 L383.8 368.7 L385.0 369.2 L386.4 369.5 L387.8 369.4 L389.1 369.2 L390.4 368.6 L391.5 367.8 L392.5 366.9 L393.4 365.2 L394.7 361.7 L396.7 354.9 L398.5 347.9 L399.9 340.9 L400.9 333.8 L401.6 326.7 L402.0 319.5 L402.0 312.4 L401.6 305.2 L400.9 298.1 L399.8 291.0 L398.4 284.0 L396.7 277.0 L394.6 270.3 L392.2 263.5 L389.5 256.9 L386.4 250.4 L383.1 244.1 L379.4 237.9 L375.4 232.0 L371.1 226.2 L366.6 220.7 L361.8 215.4 L356.7 210.3 L351.4 205.5 L345.9 200.9 L340.1 196.7 L334.2 192.7 L328.0 189.0 L321.7 185.6 L315.2 182.5 L308.6 179.8 L301.8 177.4 L295.0 175.3ZM118.4 364.8 L119.3 366.6 L120.6 367.9 L122.4 369.0 L124.4 369.5 L126.5 369.3 L128.4 368.6 L130.0 367.4 L131.2 365.7 L131.7 364.4 L132.0 363.2 L132.1 356.1 L132.6 350.0 L133.3 344.0 L134.3 338.0 L135.7 332.1 L136.6 328.7 L138.3 322.9 L140.2 317.5 L142.6 311.9 L145.2 306.4 L148.0 301.0 L151.1 295.8 L154.5 290.7 L158.1 285.9 L160.3 283.2 L164.3 278.6 L168.4 274.2 L172.6 270.3 L179.5 264.4 L187.0 259.0 L194.7 254.2 L202.8 250.0 L208.3 247.5 L211.6 246.2 L220.2 243.3 L225.7 241.8 L231.0 240.5 L232.2 240.2 L233.2 239.6 L234.0 239.0 L234.7 238.3 L235.4 237.3 L236.1 235.7 L236.4 233.9 L236.4 179.2 L236.1 177.6 L235.4 176.0 L234.4 174.6 L233.1 173.6 L231.8 173.0 L230.5 172.7 L229.2 172.6 L227.7 172.8 L223.9 173.6 L217.1 175.3 L210.3 177.3 L206.8 178.6 L200.0 181.2 L193.7 184.0 L190.4 185.6 L183.9 189.0 L178.0 192.6 L175.0 194.5 L169.1 198.7 L163.3 203.2 L160.5 205.5 L155.4 210.2 L150.3 215.3 L145.4 220.7 L140.8 226.3 L138.6 229.1 L134.7 234.8 L130.8 240.9 L127.2 247.2 L124.0 253.7 L121.2 260.0 L119.8 263.3 L117.4 270.2 L115.3 277.1 L113.5 284.1 L112.8 287.7 L111.6 294.4 L110.7 301.6 L110.2 308.9 L110.0 316.1 L110.2 323.0 L110.4 326.6 L111.1 333.8 L112.2 341.0 L113.6 348.1 L115.3 355.1 L116.3 358.5Z"
                    fill="var(--accent)"
                  />
                </svg>
              </div>
              <div className="app-card-body">
                <div className="app-card-header">
                  <h3 className="app-card-title">Aubuscores</h3>
                  <span className="app-card-price">19 €</span>
                </div>
                <p className="app-card-desc">{t("abCardDesc")}</p>
                <ul className="app-card-tags" aria-label="Tags">
                  <li className="app-card-tag">{t("cardTagDesktop")}</li>
                  <li className="app-card-tag">{t("abCardTag")}</li>
                </ul>
                <div className="app-card-footer">
                  <a
                    href="https://aubuscule.gumroad.com/l/aubuscores"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="app-card-btn"
                  >
                    {t("abCardBuy")}
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
                  width="100"
                  height="100"
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
                        cy="33"
                        r="33"
                        fill="var(--accent)"
                        fillOpacity="0.2"
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
                    href="/products/zones-tonales"
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
                    href="https://tr.ee/I9DqWD4RtT"
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

export const RealisationsGallery = ProductsGallery;
