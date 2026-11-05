/**
 * Sitemap Routes and Input Files Map
 *
 * Maps each sitemap path to its list of input files and relevant i18n namespaces.
 *
 * Rule: Shared chrome (Footer, Nav, Layouts, global CSS) is deliberately EXCLUDED
 * from route inputs so chrome edits do not bump content lastmod dates.
 * A route's inputs are only its own page file, the components it renders itself,
 * src/lib/site.ts (only where imported by the route), and its own message namespace in en/fr/nl.
 */

export const SHARED_FILES = [];

export const I18N_MESSAGES = [
  'src/i18n/messages/en.json',
  'src/i18n/messages/fr.json',
  'src/i18n/messages/nl.json',
];

export const routeNamespaces = {
  '': ['home'],
  '/agency': ['hero', 'services', 'team', 'testimonials', 'contact', 'form'],
  '/products': ['products'],
  '/products/remplate': ['remplate'],
  '/products/remplate/templates': ['remplate'],
  '/products/remplate/faq': ['remplate'],
  '/products/zones-tonales': ['zonesTonales'],
  '/dev': ['dev'],
  '/epk': ['epk'],
};

function createRouteEntry(page, specificFiles, namespaces) {
  const allFiles = Array.from(new Set([page, ...specificFiles, ...I18N_MESSAGES]));
  return {
    page,
    files: allFiles,
    namespaces,
  };
}

export const sitemapRoutes = {
  '': createRouteEntry(
    'src/app/[locale]/page.tsx',
    [
      'src/components/hub/HubHome.tsx',
      'src/components/hub/Starfield.tsx',
      'src/components/hub/hub.css',
      'src/components/shared/Select.tsx',
      'src/components/shared/ThemeToggle.tsx',
      'src/components/shared/ThemeProvider.tsx',
      'src/components/shared/Mark.tsx',
      'src/lib/site.ts',
      'src/i18n/navigation.ts',
      'src/i18n/routing.ts',
      'src/i18n/config.ts',
    ],
    routeNamespaces['']
  ),

  '/agency': createRouteEntry(
    'src/app/[locale]/agency/page.tsx',
    [
      'src/components/agency/Hero.tsx',
      'src/components/agency/Services.tsx',
      'src/components/agency/Team.tsx',
      'src/components/agency/Testimonials.tsx',
      'src/components/agency/Contact.tsx',
      'src/components/agency/ContactForm.tsx',
      'src/components/agency/agency.css',
      'src/components/shared/Mark.tsx',
      'src/components/shared/Select.tsx',
      'src/lib/site.ts',
    ],
    routeNamespaces['/agency']
  ),

  '/products': createRouteEntry(
    'src/app/[locale]/products/page.tsx',
    [
      'src/components/products/ProductsGallery.tsx',
      'src/components/products/products.css',
      'src/lib/site.ts',
      'src/i18n/navigation.ts',
      'src/i18n/routing.ts',
      'src/i18n/config.ts',
    ],
    routeNamespaces['/products']
  ),

  '/products/remplate': createRouteEntry(
    'src/app/[locale]/products/remplate/page.tsx',
    [
      'src/components/products/RemplatePage.tsx',
      'src/components/products/products.css',
      'src/i18n/navigation.ts',
      'src/i18n/routing.ts',
      'src/i18n/config.ts',
    ],
    routeNamespaces['/products/remplate']
  ),

  '/products/remplate/templates': createRouteEntry(
    'src/app/[locale]/products/remplate/templates/page.tsx',
    [
      'src/components/products/RemplateTemplates.tsx',
      'src/components/products/RemplateData.tsx',
      'src/components/products/products.css',
      'src/i18n/navigation.ts',
      'src/i18n/routing.ts',
      'src/i18n/config.ts',
    ],
    routeNamespaces['/products/remplate/templates']
  ),

  '/products/remplate/faq': createRouteEntry(
    'src/app/[locale]/products/remplate/faq/page.tsx',
    [
      'src/components/products/RemplateFAQ.tsx',
      'src/components/products/RemplateData.tsx',
      'src/components/products/products.css',
    ],
    routeNamespaces['/products/remplate/faq']
  ),

  '/products/zones-tonales': createRouteEntry(
    'src/app/[locale]/products/zones-tonales/page.tsx',
    [
      'src/components/products/ZonesTonalesPage.tsx',
      'src/components/products/products.css',
    ],
    routeNamespaces['/products/zones-tonales']
  ),

  '/dev': createRouteEntry(
    'src/app/[locale]/dev/page.tsx',
    [
      'src/components/dev/DevHero.tsx',
      'src/components/dev/DevPrinciples.tsx',
      'src/components/dev/DevDomains.tsx',
      'src/components/dev/DevWhy.tsx',
      'src/components/dev/DevShowcase.tsx',
      'src/components/dev/DevProcess.tsx',
      'src/components/dev/DevContact.tsx',
      'src/components/dev/DevContactForm.tsx',
      'src/components/dev/dev.css',
      'src/components/shared/Mark.tsx',
      'src/components/shared/Select.tsx',
      'src/lib/site.ts',
      'src/i18n/navigation.ts',
      'src/i18n/routing.ts',
      'src/i18n/config.ts',
    ],
    routeNamespaces['/dev']
  ),

  '/epk': createRouteEntry(
    'src/app/[locale]/epk/page.tsx',
    [
      'src/components/epk/EpkPage.tsx',
      'src/components/epk/epk.css',
      'src/lib/site.ts',
    ],
    routeNamespaces['/epk']
  ),
};

export const routes = sitemapRoutes;
export default sitemapRoutes;
