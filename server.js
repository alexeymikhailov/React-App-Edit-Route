const webpack=require('webpack');
const path=require('path');
const webpackDevServer=require('webpack-dev-server');
const webpackConfig=require('./webpack.config.js');

const port=3000;

const compiler=webpack(webpackConfig);
const server=new webpackDevServer(compiler, {
	publicPath: webpackConfig.output.publicPath,
	contentBase: './static',
  historyApiFallback: true,
	hot: true,
	noInfo: false,
	stats: {
		colors: true,
		hash: false,
		timings: true,
		chunks: false,
		chunkModules: false,
		modules: false
	},
	port: 3000
});

server.listen(port, (error) => {
  if (error) {
    console.log(error);
  }
  console.info(`Listening on port ${port}`);
})
