/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
// gzip压缩插件
const CompressionWebpackPlugin = require('compression-webpack-plugin');

module.exports = {
	publicPath: './',
	assetsDir: 'static',
	pages: {
		index: {
			entry: 'src/main.js',
			title: '三维空间可视化'
		}
	},

	// 不在production环境使用SourceMap
	productionSourceMap: false,

	devServer: {
		port: 3000,
		proxy: {
			'/rim-rs': {
				// target: 'http://172.17.13.36',
				target: 'http://www.a-ke.top:7300/mock/605c2ce273edd90021b89b7c',
				ws: true,
				changeOrigin: true,
				logLevel: 'debug'
				// pathRewrite: {
				// 	'^/api': ''
				// }
			},
			'/iot': {
				// target: 'http://172.17.13.36',
				target: 'http://www.a-ke.top:7300/mock/605c2ce273edd90021b89b7c',
				ws: true,
				changeOrigin: true,
				logLevel: 'debug'
				// pathRewrite: {
				// 	'^/api': ''
				// }
			},
			'/dim': {
				target: 'http://172.17.13.36:100',
				ws: true,
				changeOrigin: true,
				logLevel: 'debug'
			}
		}
	},

	configureWebpack: (config) => {
		let plugins = [];
		if (process.env.NODE_ENV === 'production') {
			// 为生产环境修改配置...
			// 移除console.log
			config.optimization.minimizer[0].options.terserOptions.compress.warnings = false;
			config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true;
			config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true;
			config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = ['console.log'];

			plugins = [
				new CompressionWebpackPlugin({
					test: new RegExp(`\\.(${['js', 'css'].join('|')})$`),
					threshold: 10240,
					minRatio: 0.8
				})
			];
			config.plugins = [...config.plugins, ...plugins];
		}
	},
	chainWebpack: (config) => {
		config.performance.set('hints', false); // 关闭性能提示
	},

	outputDir: undefined,
	runtimeCompiler: undefined,
	parallel: undefined,

	css: {
		sourceMap: process.env.NODE_ENV !== 'production',
		extract:
			process.env.NODE_ENV === 'production'
				? {
						ignoreOrder: true
				  }
				: false
	}
};
