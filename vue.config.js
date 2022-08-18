const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  indexPath: 'index3.html',

  pages: {
    index: {
      entry: 'src/main.ts',
      template: 'public/index3.html',
    },
  },

  publicPath: process.env.NODE_ENV === 'production'
    ? '/gencalc/'
    : '/',
  outputDir: 'docs',
  assetsDir: './',
  publicPath: './',

  pluginOptions: {
    i18n: {
      locale: 'ja-jp',
      fallbackLocale: 'en-us',
      localeDir: 'locales',
      enableLegacy: false,
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: true
    }
  }
})
