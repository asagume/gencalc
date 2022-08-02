import { createI18n } from 'vue-i18n'

export const messages = {
    'ja-jp': require('../public/data/locale/ja-jp.json'),
    'en-us': require('../public/data/locale/en-us.json'),
};

const i18n = createI18n({
    legacy: false,
    locale: 'ja-jp',
    fallbackLocale: 'en-us',
    messages: messages,
})
export default i18n
