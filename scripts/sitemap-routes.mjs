/**
 * Sitemap Routes and Input Files Map
 *
 * Maps each sitemap path to its list of input files and relevant i18n namespaces.
 * Deployed to Cloudflare Workers where the build has no git checkout, so dates
 * are tracked via content hashing and committed in src/lib/sitemap-dates.json.
 */

export const SHARED_FILES = [
  'src/app/layout.tsx',
  'src/app/[locale]/layout.tsx',
  'src/app/globals.css',
  'src/styles/tokens.css',
  'src/styles/reset.css',
  'src/styles/shared.css',
  'src/styles/nav.css',
  'src/styles/footer.css',
  'src/styles/responsive.css',
  'src/components/shared/Nav.tsx',
  'src/components/shared/Footer.tsx',
  'src/components/shared/Logo.tsx',
  'src/components/shared/Mark.tsx',
  'src/components/shared/ThemeProvider.tsx',
  'src/components/shared/ThemeToggle.tsx',
  'src/components/shared/Select.tsx',
  'src/lib/site.ts',
  'src/i18n/config.ts',
  'src/i18n/navigation.ts',
  'src/i18n/routing.ts',
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
  const allFiles = Array.from(new Set([page, ...specificFiles, ...SHARED_FILES]));
  allFiles.page = page;
  allFiles.files = allFiles;
  allFiles.namespaces = namespaces;
  return allFiles;
}

export const sitemapRoutes = {
  '': createRouteEntry(
    'src/app/[locale]/page.tsx',
    [
      'src/components/hub/HubHome.tsx',
      'src/components/hub/Starfield.tsx',
      'src/components/hub/hub.css',
    ],
    routeNamespaces['']
  ),

  '/agency': createRouteEntry(
    'src/app/[locale]/agency/page.tsx',
    [
      'src/app/[locale]/agency/layout.tsx',
      'src/components/agency/Hero.tsx',
      'src/components/agency/Services.tsx',
      'src/components/agency/Team.tsx',
      'src/components/agency/Testimonials.tsx',
      'src/components/agency/Contact.tsx',
      'src/components/agency/ContactForm.tsx',
      'src/components/agency/agency.css',
    ],
    routeNamespaces['/agency']
  ),

  '/products': createRouteEntry(
    'src/app/[locale]/products/page.tsx',
    [
      'src/components/products/ProductsGallery.tsx',
      'src/components/products/products.css',
    ],
    routeNamespaces['/products']
  ),

  '/products/remplate': createRouteEntry(
    'src/app/[locale]/products/remplate/page.tsx',
    [
      'src/app/[locale]/products/remplate/layout.tsx',
      'src/components/products/RemplatePage.tsx',
      'src/components/products/AppSubNav.tsx',
      'src/components/products/products.css',
    ],
    routeNamespaces['/products/remplate']
  ),

  '/products/remplate/templates': createRouteEntry(
    'src/app/[locale]/products/remplate/templates/page.tsx',
    [
      'src/app/[locale]/products/remplate/layout.tsx',
      'src/components/products/RemplateTemplates.tsx',
      'src/components/products/RemplateData.tsx',
      'src/components/products/AppSubNav.tsx',
      'src/components/products/products.css',
    ],
    routeNamespaces['/products/remplate/templates']
  ),

  '/products/remplate/faq': createRouteEntry(
    'src/app/[locale]/products/remplate/faq/page.tsx',
    [
      'src/app/[locale]/products/remplate/layout.tsx',
      'src/components/products/RemplateFAQ.tsx',
      'src/components/products/RemplateData.tsx',
      'src/components/products/AppSubNav.tsx',
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
      'src/app/[locale]/dev/layout.tsx',
      'src/components/dev/DevHero.tsx',
      'src/components/dev/DevPrinciples.tsx',
      'src/components/dev/DevDomains.tsx',
      'src/components/dev/DevWhy.tsx',
      'src/components/dev/DevShowcase.tsx',
      'src/components/dev/DevProcess.tsx',
      'src/components/dev/DevContact.tsx',
      'src/components/dev/DevContactForm.tsx',
      'src/components/dev/dev.css',
    ],
    routeNamespaces['/dev']
  ),

  '/epk': createRouteEntry(
    'src/app/[locale]/epk/page.tsx',
    [
      'src/app/[locale]/epk/layout.tsx',
      'src/components/epk/EpkPage.tsx',
      'src/components/epk/epk.css',
    ],
    routeNamespaces['/epk']
  ),
};

export const routes = sitemapRoutes;
export default sitemapRoutes;
