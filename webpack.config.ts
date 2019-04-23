// tslint:disable:no-var-requires
import * as webpack from 'webpack';
import * as nodeExternals from 'webpack-node-externals';
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

/* import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin'; */
// this is TsconfigPathsPlugin error
/* /Users/syr/Documents/meuworks/discordjs-voice-test/node_modules/tsconfig-paths/lib/tsconfig-loader.js:72
    var config = JSON.parse(cleanedJson);
                      ^
SyntaxError: Unexpected token ] in JSON at position 199 */
import * as path from 'path';
import * as fs from 'fs';

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath: string) =>
  path.resolve(appDirectory, relativePath);

const paths = {
  // dotenv: resolveApp('.env'),
  projectRoot: resolveApp(''),
  appBuild: resolveApp('build'),
  appIndexTs: resolveApp('src/index.ts'),
  appTsLint: resolveApp('tslint.json'),
  appTsConfig: resolveApp('tsconfig.json'),
  appNodeModules: resolveApp('node_modules'),
  // appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  // appNodeModules: resolveApp('node_modules'),
  logDirectory: resolveApp('log'),
};

const TSLINT_LOADER_OPTION = {
  configFile: paths.appTsLint,
  tsConfigFile: paths.appTsConfig,
  formatter: 'codeFrame',
};

const config: webpack.Configuration = {
  mode: 'production',
  devtool: 'source-map',
  target: 'node',
  externals: [
    nodeExternals({
      modulesDir: paths.appNodeModules,
    }),
  ],
  entry: paths.appIndexTs,
  output: {
    path: paths.appBuild,
    filename: 'index.js',
  },
  module: {
    wrappedContextCritical: true,
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        use: [
          {
            loader: 'tslint-loader',
            options: TSLINT_LOADER_OPTION,
          },
        ],
        include: paths.appSrc,
        exclude: paths.appNodeModules,
      },
      {
        test: /\.ts$/,
        use: 'awesome-typescript-loader',
        include: paths.appSrc,
        exclude: paths.appNodeModules,
      },
      {
        test: /\.mjs$/,
        include: paths.appNodeModules,
        type: 'javascript/auto',
      },
    ],
  },
  node: {
    console: true,
    global: true,
    process: true,
    __filename: true,
    __dirname: true,
    Buffer: true,
    setImmediate: true,
  },
  resolve: {
    extensions: ['.ts', '.js', '.mjs'],
    /* plugins: [
      new TsconfigPathsPlugin({
        configFile: paths.appTsConfig,
      })
    ], */
  },
  plugins: [
    new CleanWebpackPlugin([paths.appBuild], { root: paths.projectRoot }),
  ] as webpack.Plugin[],
  optimization: {
    minimizer: [new TerserWebpackPlugin({ sourceMap: true })],
  },
};

export default config;
