const fs = require('fs');

const langs = ['en', 'zh', 'es', 'de', 'ja', 'ko', 'ru', 'pt', 'ar', 'fr', 'it', 'hi'];
const baseUrl = 'https://www.jingtuomaterials.com';

const pages = [
  { path: '', priority: '1.0', freq: 'weekly' },
  { path: 'about.html', priority: '0.8', freq: 'monthly' },
  { path: 'products.html', priority: '0.9', freq: 'weekly' },
  { path: 'products/pseudoboehmite.html', priority: '0.9', freq: 'monthly' },
  { path: 'products/microcrystalline-alumina.html', priority: '0.9', freq: 'monthly' },
  { path: 'products/alumina-carrier.html', priority: '0.9', freq: 'monthly' },
  { path: 'products/alumina-microspheres.html', priority: '0.9', freq: 'monthly' },
  { path: 'applications.html', priority: '0.8', freq: 'monthly' },
  { path: 'news.html', priority: '0.7', freq: 'weekly' },
  { path: 'contact.html', priority: '0.8', freq: 'monthly' },
  { path: 'request-quote.html', priority: '0.9', freq: 'monthly' },
  { path: 'certifications.html', priority: '0.6', freq: 'monthly' },
  { path: 'facilities.html', priority: '0.6', freq: 'monthly' },
  { path: 'faq.html', priority: '0.5', freq: 'monthly' },
  { path: 'privacy-policy.html', priority: '0.3', freq: 'yearly' },
  { path: 'terms-of-service.html', priority: '0.3', freq: 'yearly' },
  { path: 'sitemap.html', priority: '0.4', freq: 'monthly' },
  { path: 'downloads.html', priority: '0.6', freq: 'monthly' },
  { path: 'history.html', priority: '0.5', freq: 'monthly' },
  { path: 'technical-articles.html', priority: '0.6', freq: 'weekly' },
  { path: 'request-sample.html', priority: '0.8', freq: 'monthly' }
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

const today = new Date().toISOString().split('T')[0];

for (const page of pages) {
    for (const lang of langs) {
        let pagePath = page.path;
        let langPrefix = lang === 'en' ? '/' : `/${lang}/`;
        let loc = `${baseUrl}${langPrefix}${pagePath}`;
        
        xml += `  <url>\n`;
        xml += `    <loc>${loc}</loc>\n`;
        
        // Hreflang tags
        for (const l of langs) {
            let lPrefix = l === 'en' ? '/' : `/${l}/`;
            xml += `    <xhtml:link rel="alternate" hreflang="${l}" href="${baseUrl}${lPrefix}${pagePath}"/>\n`;
        }
        xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/${pagePath}"/>\n`;
        
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>${page.freq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `  </url>\n`;
    }
}

xml += `</urlset>`;

fs.writeFileSync('sitemap.xml', xml);
console.log('Sitemap built for all 12 languages!');
