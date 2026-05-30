// ========================================
// APP CONFIGURATION & i18n SETUP
// ========================================

const CONFIG = {
  version: '2.0.0',
  theme: localStorage.getItem('theme') || 'dark',
  language: localStorage.getItem('language') || 'en',
  difficulty: localStorage.getItem('difficulty') || 'intermediate',
  fps: 120,
  performanceMode: true
};

class i18nManager {
  constructor() {
    this.translations = {};
    this.currentLanguage = CONFIG.language;
    this.supportedLanguages = ['en', 'ru', 'es', 'fr', 'de', 'pt', 'ja', 'zh', 'ko', 'ar'];
    this.languagesByPopularity = ['en', 'es', 'fr', 'ru', 'pt', 'de', 'ja', 'zh', 'ko', 'ar'];
  }

  async init() {
    try {
      const response = await fetch('i18n.json');
      this.translations = await response.json();
      this.setLanguage(this.currentLanguage);
      this.applyUITranslations();
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  }

  setLanguage(lang) {
    if (this.supportedLanguages.includes(lang)) {
      this.currentLanguage = lang;
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
      document.documentElement.setAttribute('data-language', lang);
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
      this.applyUITranslations();
    }
  }

  t(key) {
    return this.translations[this.currentLanguage]?.[key] || this.translations.en?.[key] || key;
  }

  applyUITranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.t(key);
    });
  }

  getLanguages() {
    return this.languagesByPopularity.map(lang => ({
      code: lang,
      name: this.translations[lang]?.name || lang,
      flag: this.translations[lang]?.flag || ''
    }));
  }
}

const i18n = new i18nManager();

// ========================================
// THEME MANAGER
// ========================================

class ThemeManager {
  constructor() {
    this.currentTheme = CONFIG.theme;
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.setupThemeToggle();
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    if (theme === 'light') {
      document.documentElement.style.colorScheme = 'light';
      this.applyLightTheme();
    } else {
      document.documentElement.style.colorScheme = 'dark';
      this.applyDarkTheme();
    }

    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  applyDarkTheme() {
    const style = document.documentElement.style;
    style.setProperty('--bg-primary', '#0f0f1e');
    style.setProperty('--bg-secondary', '#1a1a2e');
    style.setProperty('--bg-card', '#16213e');
    style.setProperty('--text-primary', '#ffffff');
    style.setProperty('--text-secondary', '#b8bbc4');
  }

  applyLightTheme() {
    const style = document.documentElement.style;
    style.setProperty('--bg-primary', '#f5f5f7');
    style.setProperty('--bg-secondary', '#ffffff');
    style.setProperty('--bg-card', '#efefef');
    style.setProperty('--text-primary', '#1a1a1a');
    style.setProperty('--text-secondary', '#666666');
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }

  setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }
}

const themeManager = new ThemeManager();
