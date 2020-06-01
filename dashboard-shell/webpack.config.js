const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack").container
  .ModuleFederationPlugin;

module.exports = {
  entry: "./src/index",
  mode: "development",
  devtool: "source-map",
  //   output: {
  //     path: __dirname + "/public",
  //     publicPath: "/",
  //     filename: "bundle.js",
  //   },
  output: {
    publicPath: "http://localhost:3001/",
  },
  optimization: {
    minimize: false,
  },
  resolve: {
    extensions: [".jsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: require.resolve("babel-loader"),
        exclude: /node_modules/,
        options: {
          presets: [require.resolve("@babel/preset-react")],
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "dashboard-shell",
      library: { type: "var", name: "dashboard-shell" },
      filename: "remoteEntry.js",
      //TODO: Fill in below later
      remotes: {},
      exposes: {},
      shared: [],
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
