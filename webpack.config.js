const webpack=require('webpack');
const path=require('path');

module.exports={
  devtool: 'source-map',
  mode: 'development',
  entry: {
    bundle: [
      'react-hot-loader/patch',
      './src/js/index.js'
    ]
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader'
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          }
        ]
      },
      {
        test: /\.(jpe?g|png)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
							name: '[name].[ext]',
							limit: 10000
						}
          }
        ]
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
    			{
    				loader: 'url-loader',
    				options: {
    					mimetype: 'application/font-woff',
    					limit: 10000
    				}
    			}
  			]
      },
      {
  			test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
  			use: [
					{
						loader: 'url-loader'
					}
				]
  		}
    ]
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ],
    extensions: ['.js', '.jsx', '.css']
  },
  output: {
    path: path.join(__dirname, '/static'),
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: '/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
