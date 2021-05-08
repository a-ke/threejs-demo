import Vue from 'vue';
import VueRouter from 'vue-router';

const Home = () => import(/* webpackChunkName: "bim" */ '../views/Home.vue');
const Tower3D = () => import(/* webpackChunkName: "bim" */ '../views/Tower3D.vue');

Vue.use(VueRouter);

const routes = [
	{
		path: '/',
		redirect: { name: 'Tower3D' }
	},
	{
		path: '/home',
		name: 'Home',
		component: Home
	},
	{
		path: '/tower3D',
		name: 'Tower3D',
		component: Tower3D
	}
];

const router = new VueRouter({
	routes
});

export default router;
