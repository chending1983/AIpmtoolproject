const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const targetDir = __dirname;
const indexHtmlContent = fs.readFileSync(path.join(targetDir, 'index.html'), 'utf-8');
const translationsMatch = indexHtmlContent.match(/const translations = ({[\s\S]*?});\s*let currentLang/);

if (!translationsMatch) {
    console.error("Could not find translations in index.html");
    process.exit(1);
}

let translations;
try {
    translations = eval('(' + translationsMatch[1] + ')');
} catch (e) {
    console.error("Failed to parse translations:", e);
    process.exit(1);
}

function getJsonLd(lang) {
    const isZh = lang === 'zh';
    const orgName = isZh ? '山东晶拓新材料科技有限公司' : 'Shandong Jingtuo New Materials Technology Co., Ltd.';
    const url = `https://www.jingtuomaterials.com/${isZh ? 'zh/' : ''}`;
    
    return `
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "${orgName}",
      "url": "${url}",
      "logo": "https://www.jingtuomaterials.com/images/logo.svg",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+86-123-4567-8900",
        "contactType": "customer service",
        "email": "info@jingtuomaterials.com",
        "availableLanguage": ["English", "Chinese"]
      }
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "${orgName}",
      "url": "${url}"
    }
    </script>
    `.trim();
}

function walkDir(dir, filesList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.startsWith('.') || file === 'node_modules' || file === 'components') continue;
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walkDir(filePath, filesList);
        } else if (file.endsWith('.html')) {
            filesList.push(filePath);
        }
    }
    return filesList;
}

const allHtmlFiles = walkDir(targetDir);

for (const filePath of allHtmlFiles) {
    const relPath = path.relative(targetDir, filePath);
    
    let lang = 'en'; 
    const firstDir = relPath.split(path.sep)[0];
    const langs = ['zh', 'es', 'de', 'ja', 'ko', 'ru', 'pt', 'ar', 'fr', 'it', 'hi'];
    if (langs.includes(firstDir)) {
        lang = firstDir;
    }
    
    // In actual translations block, if missing, default to en
    const tLang = translations[lang] ? lang : 'en';
    const t = translations[tLang];
    
    let content = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(content, { decodeEntities: false });

    // 1. Update <html lang="XX">
    $('html').attr('lang', lang);

    // 2. Add JSON-LD if not present
    if (content.indexOf('application/ld+json') === -1) {
        $('head').append('\\n    ' + getJsonLd(lang) + '\\n');
    }

    // 3. Process data-i18n attributes
    $('[data-i18n]').each((i, el) => {
        const key = $(el).attr('data-i18n');
        const translatedText = t[key];
        
        if (translatedText) {
            if (el.tagName === 'title') {
                $(el).text(translatedText);
            } else if (el.tagName === 'meta') {
                $(el).attr('content', translatedText);
            } else {
                $(el).text(translatedText);
            }
        }
    });

    // 4. Update the currentLang variable in scripts so the JS matching is exact
    $('script').each((i, el) => {
        let scriptHtml = $(el).html();
        if (scriptHtml && scriptHtml.includes('currentLang')) {
            scriptHtml = scriptHtml.replace(/let\s+currentLang\s*=\s*'[^']+';/g, `let currentLang = '${lang}';`);
            scriptHtml = scriptHtml.replace(/currentLang\s*=\s*'[^']+';\s*\/\/\s*Try to update language/g, `currentLang = '${lang}';\n            // Try to update language`);
            $(el).html(scriptHtml);
        }
    });

    // 5. Enhance empty image alts
    $('img').each((i, el) => {
        if (!$(el).attr('alt')) {
            const isZh = lang === 'zh';
            $(el).attr('alt', isZh ? '晶拓氧化铝产品图片' : 'Jingtuo Alumina Product Image');
        }
    });

    // Save
    fs.writeFileSync(filePath, $.html());
    console.log(`Optimized ${relPath} for SEO (lang=${lang})`);
}

console.log("SEO optimization structure complete!");
