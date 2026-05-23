export class LanguageManager {
    constructor() {
        this.langSelector = document.getElementById('langSelector');
        this.currentLang = 'es';
        this.translations = {};

        this.init();
    }

    async init() {
        await this.loadTranslations(this.currentLang);
        this.translatePage();

        this.langSelector.addEventListener('change', async (e) => {
            this.currentLang = e.target.value;
            await this.loadTranslations(this.currentLang);
            this.translatePage();
        });
    }

    async loadTranslations(lang) {
        try {
            const response = await fetch(`./i18n/${lang}.json`);
            this.translations = await response.json();
            document.body.setAttribute('data-lang', lang);
        } catch (e) {
            console.error('Error loading translations:', e);
        }
    }

    translatePage() {
        // Elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.translations[key]) {
                // If it has children (like icons), only replace the text part
                if (el.children.length > 0) {
                    const icon = el.querySelector('i');
                    el.innerHTML = '';
                    if (icon) el.appendChild(icon);
                    el.appendChild(document.createTextNode(' ' + this.translations[key]));
                } else {
                    el.textContent = this.translations[key];
                }
            }
        });

        // Elements with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (this.translations[key]) {
                el.placeholder = this.translations[key];
            }
        });
    }

    getTranslation(key) {
        return this.translations[key] || key;
    }
}
