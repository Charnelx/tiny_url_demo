var webpack            = require('webpack');
var path               = require('path');
var ExtractTextPlugin  = require('extract-text-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HtmlWebpackPlugin  = require('html-webpack-plugin');

var publicPath         = process.env.NODE_ENV === 'production' ? './static' : 'http://localhost:8050/public/assets';
var cssName            = process.env.NODE_ENV === 'production' ? 'styles-[hash].css' : 'styles.css';
var jsName             = process.env.NODE_ENV === 'production' ? 'bundle-[hash].js' : 'bundle.js';

var plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      BROWSER:  JSON.stringify(true),
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }
  }),
  new ExtractTextPlugin(cssName)
];

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new CleanWebpackPlugin([ 'shortener/templates/index.html', 'shortener/static', 'minimo/staticfiles/*.*' ], {
      exclude:  ['minimo/staticfiles/admin'],
      root: __dirname,
      verbose: true,
      dry: false
    })
  );
  plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      mangle: {
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        screw_ie8: true
      },
      comments: false,
      sourceMap: true
    })
  );
}

plugins.push(
  new HtmlWebpackPlugin({
    template: 'src/index.template.ejs',
    filename: `${__dirname}/shortener/templates/index.html`,
    inject: 'body',
  })
)

module.exports = {
  entry: ['babel-polyfill', './src/client.js'],
  resolve: {
    modules: [path.join(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.jsx']
  },
  plugins,
  output: {
    path: `${__dirname}/shortener/static/`,
    filename: jsName,
    publicPath
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader!postcss-loader'})
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader!postcss-loader!less-loader'})
      },
      { test: /\.gif$/, use: 'url-loader?limit=10000&mimetype=image/gif' },
      { test: /\.jpg$/, use: 'url-loader?limit=10000&mimetype=image/jpg' },
      { test: /\.png$/, use: 'url-loader?limit=10000&mimetype=image/png' },
      { test: /\.svg/, use: 'url-loader?limit=26000&mimetype=image/svg+xml' },
      { test: /\.(woff|woff2|ttf|eot)/, use: 'url-loader?limit=1' },
      { test: /\.jsx?$/, use: process.env.NODE_ENV !== 'production' ? ['babel-loader', 'eslint-loader'] : 'babel-loader', exclude: [/node_modules/, /public/] },
      { test: /\.json$/, use: 'json-loader' },
    ]
  },
  devtool: process.env.NODE_ENV !== 'production' ? 'eval-source-map' : false,
  devServer: {
    headers: { 'Access-Control-Allow-Origin': '*' }
  }
};
