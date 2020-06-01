const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack").container
  .ModuleFederationPlugin;

module.exports = {
  entry: "./src/index",
  mode: "development",
  devtool: "source-map",
  // This tells webpack-dev-server to serve the files from the dist directory on localhost:8080
  devServer: {
    contentBase: "./dist",
    port: "3001",
  },
  output: {
    path: __dirname + "/public",
    publicPath: "/",
    filename: "[name].bundle.js",
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
