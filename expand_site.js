const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const targetDir = __dirname;
const langs = ['en', 'zh', 'es', 'de', 'ja', 'ko', 'ru', 'pt', 'ar', 'fr', 'it', 'hi'];

// 1. Load existing translations from index.html
let indexHtmlContent = fs.readFileSync(path.join(targetDir, 'index.html'), 'utf-8');
const translationsMatch = indexHtmlContent.match(/const translations = ({[\s\S]*?});\s*(?:let|const)\s+currentLang/);
let translations = {};
if (translationsMatch) {
    translations = eval('(' + translationsMatch[1] + ')');
} else {
    console.error("Could not find translations in index.html, aborting.");
    process.exit(1);
}

// 2. Merge new translations
const newTranslations = JSON.parse(fs.readFileSync(path.join(targetDir, 'new_translations.json'), 'utf-8'));
for (const lang of Object.keys(newTranslations)) {
    if (!translations[lang]) translations[lang] = {};
    // Fallback everything from 'en' first to ensure all keys exist
    translations[lang] = { ...translations['en'], ...translations[lang], ...newTranslations[lang] };
}

// 3. Create folders and copy files from EN to the new language folders
function copyEnglishStructure() {
    // English files are in the root and in /products etc. (excluding node_modules, .git, and lang folders)
    const ignoreDirs = new Set(['node_modules', '.git', 'css', 'images', 'js', 'components', ...langs]);
    
    function copyDirRecursive(srcDir, destDir) {
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        const items = fs.readdirSync(srcDir);
        for (const item of items) {
            if (ignoreDirs.has(item)) continue;
            const srcPath = path.join(srcDir, item);
            const destPath = path.join(destDir, item);
            const stat = fs.statSync(srcPath);
            if (stat.isDirectory()) {
                if (srcDir === targetDir && langs.includes(item)) continue; // skip copying existing lang folders
                copyDirRecursive(srcPath, destPath);
            } else if (item.endsWith('.html')) {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    for (const lang of langs) {
        if (lang === 'en' || lang === 'zh') continue; // keep zh intact, en is root
        console.log(`Cloning structure for ${lang}...`);
        copyDirRecursive(targetDir, path.join(targetDir, lang));
    }
}
copyEnglishStructure();

// 4. Update index.html internally to hold all translations
const updatedTranslationsStr = JSON.stringify(translations, null, 4);
indexHtmlContent = indexHtmlContent.replace(/const translations = {[\s\S]*?};\s*(?:let|const)\s+currentLang/g, `const translations = ${updatedTranslationsStr};\n        let currentLang`);

// Also update language buttons in the header
const langNames = {
    en: 'EN', zh: '中文', es: 'ES', de: 'DE', ja: '日本語', 
    ko: '한국어', ru: 'RU', pt: 'PT', ar: 'AR', fr: 'FR', it: 'IT', hi: 'HI'
};
let switcherHtml = '<div class="language-switcher lang-switcher-enhanced" role="group" aria-label="语言选择" style="display: flex; gap: 5px; flex-wrap: wrap; max-width: 300px;">\n';
for (const l of langs) {
    switcherHtml += `                    <button class="lang-btn lang-btn-enhanced" data-lang="${l}" aria-label="${langNames[l]}">${langNames[l]}</button>\n`;
}
switcherHtml += '                </div>';

indexHtmlContent = indexHtmlContent.replace(/<div class="language-switcher[^>]*>[\s\S]*?<\/div>/, switcherHtml);
fs.writeFileSync(path.join(targetDir, 'index.html'), indexHtmlContent);

console.log("Structure expanded! Now you can run `node seo_builder.js` to compile the changes.");
