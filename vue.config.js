const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,

  pages: {
    index: {
      entry: 'src/main.ts',
      template: 'public/index3.html',
      filename: 'index.html',
    },
  },

  publicPath: process.env.NODE_ENV === 'production'
    ? '/gencalc/'
    : '/',
  outputDir: 'docs',
  assetsDir: './',

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
