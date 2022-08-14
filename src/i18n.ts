import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: process.env.VUE_APP_I18N_LOCALE,
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE,
  isGlobal: true,
})
export default i18n;
