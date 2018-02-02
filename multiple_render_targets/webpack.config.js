// ビルド設定ファイル
const buidConfig = require("./build_config");

const entry = {};

/** webpackの設定ファイルです。 */
let webpackConfig = {
  entry: buidConfig.tsEntryFiles,
  output: {
    filename: "[name].js"
  },
  devtool: "source-map",
  resolve: {
    extensions: ["*", ".ts", ".js"]
  },
  module: {
    loaders: [
      {test: /\.ts$/, loader: 'ts-loader'}
    ]
  }
};

module.exports = webpackConfig;
