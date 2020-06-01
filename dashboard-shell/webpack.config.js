const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack").container
  .ModuleFederationPlugin;

module.exports = {
  // This is the starting point for webpack, this is where it starts to crawl your repository to build a dependency graph
  entry: "./src/index",
  // This tells webpack to optimize the build according to the environment more details here: https://webpack.js.org/configuration/mode/
  mode: "development",
  // his option controls if and how source maps are generated.
  devtool: "source-map",
  // This tells webpack-dev-server to serve the files from the dist directory on localhost:8080
  devServer: {
    contentBase: "./dist",
    port: "3001",
  },
  // instructs webpack on how and where it should output your bundles, assets and anything else you bundle or load with webpack.
  output: {
    path: __dirname + "/public",
    publicPath: "/",
    filename: "[name].bundle.js",
  },
  // These options change how modules are resolved.
  resolve: {
    extensions: [".jsx", ".js"],
  },
  // Out of the box, webpack only understands JavaScript and JSON files. Loaders allow webpack to process other types of files and convert them into valid modules that can be consumed by your application and added to the dependency graph.
  module: {
    rules: [
      // Loader has two "required" properties, test & use/loader, test is used to identifer the files the specific loader should transform, in case below babel-loader should look at jsx files.
      {
        test: /\.jsx?$/,
        loader: require.resolve("babel-loader"),
        exclude: /node_modules/,
        // Options for the plugin
        options: {
          presets: [require.resolve("@babel/preset-react")],
        },
      },
    ],
  },
  // Loaders are used to transform certain types of modules, plugins can be leveraged to perform a wider range of tasks like bundle optimization, asset management and injection of environment variables.
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
    // The HtmlWebpackPlugin simplifies creation of HTML files to serve your webpack bundles. This is especially useful for webpack bundles that include a hash in the filename which changes every compilation
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
