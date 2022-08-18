import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'ja-jp',
  fallbackLocale: 'en-us',
  isGlobal: true,
})
export default i18n;
