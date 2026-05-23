export class ThemeManager {
    constructor() {
        this.body = document.body;
        this.themeToggle = document.getElementById('themeToggle');
        this.logo = document.getElementById('projectLogo');
        this.colorThief = new ColorThief();

        this.init();
    }

    init() {
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Listen for logo changes to update accent colors
        this.logo.addEventListener('load', () => this.extractColors());
    }

    toggleTheme() {
        const isDark = this.body.classList.contains('dark-mode');
        if (isDark) {
            this.body.classList.remove('dark-mode');
            this.body.classList.add('light-mode');
            this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            this.body.classList.remove('light-mode');
            this.body.classList.add('dark-mode');
            this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    extractColors() {
        if (!this.logo.src || this.logo.src.includes('placeholder')) return;

        try {
            const palette = this.colorThief.getPalette(this.logo, 5);
            const primaryColor = palette[0]; // [R, G, B]
            const secondaryColor = palette[1];

            const accent = `rgb(${primaryColor[0]}, ${primaryColor[1]}, ${primaryColor[2]})`;
            const accentHover = `rgb(${secondaryColor[0]}, ${secondaryColor[1]}, ${secondaryColor[2]})`;

            document.documentElement.style.setProperty('--accent', accent);
            document.documentElement.style.setProperty('--accent-hover', accentHover);

            console.log('Theme updated with colors:', accent, accentHover);
        } catch (e) {
            console.error('Error extracting colors:', e);
        }
    }
}
