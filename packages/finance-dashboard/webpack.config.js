const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ModuleFederationPlugin = require("webpack").container
  .ModuleFederationPlugin;
const path = require("path");

module.exports = (env) => {
  const isEnvProduction = env.production;
  const isEnvDevelopment = env.development;

  return {
    // This is the starting point for webpack, this is where it starts to crawl your repository to build a dependency graph
    entry: "./src/index",
    // This tells webpack to optimize the build according to the environment more details here: https://webpack.js.org/configuration/mode/
    mode: !isEnvProduction ? "development" : "production",
    // his option controls if and how source maps are generated.
    devtool: "source-map",
    // instructs webpack on how and where it should output your bundles, assets and anything else you bundle or load with webpack.
    output: {
      path: path.join(__dirname, "build"),
      publicPath: "http://localhost:3002/",
      filename: isEnvProduction
        ? "static/js/[name].[contenthash].js"
        : isEnvDevelopment && "static/js/bundle.js",
      chunkFilename: isEnvProduction
        ? "static/js/[name].[contenthash].chunk.js"
        : isEnvDevelopment && "static/js/[name].chunk.js",
    },
    // This tells webpack-dev-server to serve the files from the dist directory on localhost:8080
    devServer: {
      contentBase: path.join(__dirname, "dist"),
      port: "3002",
    },
    // Customize Webpack Optimization
    optimization: {
      minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
    },
    // These options change how modules are resolved.
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
    // Out of the box, webpack only understands JavaScript and JSON files. Loaders allow webpack to process other types of files and convert them into valid modules that can be consumed by your application and added to the dependency graph.
    module: {
      rules: [
        // Loader has two "required" properties, test & use/loader, test is used to identifer the files the specific loader should transform, in case below babel-loader should look at jsx files.
        {
          test: /\.(tsx|jsx)$/,
          loader: require.resolve("babel-loader"),
          exclude: /node_modules/,
          // Options for the plugin
          options: {
            presets: ["@babel/preset-react", "@babel/preset-typescript"],
          },
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
      ],
    },
    // Loaders are used to transform certain types of modules, plugins can be leveraged to perform a wider range of tasks like bundle optimization, asset management and injection of environment variables.
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: "static/css/[name].[contenthash].css",
        chunkFilename: "static/css/[id].[contenthash].chunk.css",
      }),
      new ModuleFederationPlugin({
        name: "finance",
        library: { type: "var", name: "finance" },
        filename: "remoteEntry.js",
        exposes: {
          FinanceTile: "./src/FinanceApp.tsx",
        },
        //TODO: Fill in below later
        remotes: {
          dashboardshell: "dashboardshell",
        },
        shared: ["react", "react-dom"],
      }),
      // The HtmlWebpackPlugin simplifies creation of HTML files to serve your webpack bundles. This is especially useful for webpack bundles that include a hash in the filename which changes every compilation
      new HtmlWebpackPlugin({
        template: "./public/index.html",
      }),
    ],
  };
};
