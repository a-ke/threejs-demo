import 'core-js/stable';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'regenerator-runtime/runtime';

import '@/assets/css/reset.css';

import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import router from './router';

import '@/assets/css/common.scss';
import 'animate.css';

import '@/assets/js/filter';

Vue.use(ElementUI);

Vue.config.productionTip = false;

new Vue({
	router,
	render: (h) => h(App)
}).$mount('#app');
