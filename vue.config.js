const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,

  pages: {
    index: {
      entry: 'src/main.ts',
      template: 'public/index3.html',
      filename: 'index.html',
    },
    EnkaNetwork: {
      entry: 'src/pages/EnkaNetwork/main.ts',
      template: 'public/EnkaNetwork3.html',
      filename: 'EnkaNetwork3.html',
    },
    EnergyRecharge: {
      entry: 'src/pages/EnergyRecharge/main.ts',
      template: 'public/EnergyRecharge.html',
      filename: 'EnergyRecharge.html',
    },
    TeamManager: {
      entry: 'src/pages/TeamManager/main.ts',
      template: 'public/TeamManager.html',
      filename: 'TeamManager.html',
    },
    TeamOptionList: {
      entry: 'src/pages/TeamOptionList/main.ts',
      template: 'public/TeamOptionList.html',
      filename: 'TeamOptionList.html',
    },
    CritTarget: {
      entry: 'src/pages/CritTarget/main.ts',
      template: 'public/CritTarget.html',
      filename: 'CritTarget.html',
    },
    RecommendationList: {
      entry: 'src/pages/RecommendationList/main.ts',
      template: 'public/RecommendationList.html',
      filename: 'RecommendationList.html',
    },
    GoogleDriveTest: {
      entry: 'src/pages/GoogleDrive/main.ts',
      template: 'public/GoogleDrive.html',
      filename: 'GoogleDrive.html',
    },
    TeamExample: {
      entry: 'src/pages/TeamExample/main.ts',
      template: 'public/TeamExample.html',
      filename: 'TeamExample.html',
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
