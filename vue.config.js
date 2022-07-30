const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  indexPath: 'indexV.html',
  pages: {
    index: {
      entry: 'src/main.ts',
      template: 'public/indexV.html',
    },
  },
})
