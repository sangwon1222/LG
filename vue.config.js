// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// https://cli.vuejs.org/config/#css-requiremoduleextension

module.exports = {
  assetsDir: "./",
  productionSourceMap: true,
  publicPath: "./",
  outputDir: "dist",
  lintOnSave: "default",
  filenameHashing: false,
  configureWebpack: {
    // resolve.alias는 모듈을 더 쉽게 import, require 하게 만듭니다.
    resolve: {
      alias: {
        // '@': path.join(__dirname, './assets')
      },
    },
  },
  // pages: {
  //     index: {
  //         // entry for the page
  //         entry: 'src/index/main.ts',
  //         // the source template
  //         template: 'public/index.html',
  //         // output as dist/index.html
  //         filename: 'index.html',
  //         // when using title option,
  //         // template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
  //         title: 'Index Page',
  //         // chunks to include on this page, by default includes
  //         // extracted common chunks and vendor chunks.
  //         chunks: ['chunk-vendors', 'chunk-common', 'index']
  //     }
  // }
};
