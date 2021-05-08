module.exports = {
	root: true,
	env: {
		es6: true,
		node: true
	},
	globals: { dataConfig: true, videojs: true }, // 全局变量，不需要eslint校验
	plugins: ['prettier'],
	extends: ['plugin:vue/recommended', 'airbnb-base', 'prettier', 'prettier/vue'],
	parserOptions: {
		parser: 'babel-eslint'
	},
	settings: {
		'import/resolver': {
			webpack: {
				//此处config对应webpack.config.js的路径，我这个路径是vue-cli3默认的路径
				config: 'node_modules/@vue/cli-service/webpack.config.js'
			}
		}
	},
	rules: {
		'import/extensions': [
			'off',
			'always',
			{
				js: 'never',
				vue: 'never'
			}
		],
		'no-restricted-syntax': 'off',
		'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
		'prefer-destructuring': 'off',
		'no-param-reassign': 'off',
		'no-underscore-dangle': 'off',
		'func-names': 'off',
		'no-console': 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'prettier/prettier': 'error',
		'template-curly-spacing': ['error', 'never'],
		'function-paren-newline': 'off',
		'new-cap': ['error', { newIsCap: false }],
		'vue/no-v-html': 'off',
		'no-continue': 'off',
		'no-unused-expressions': 'off',
		'no-use-before-define': 'off'
	}
};
