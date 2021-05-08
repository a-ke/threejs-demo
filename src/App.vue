<template>
	<div id="app">
		<router-view></router-view>
		<menu-btn></menu-btn>
	</div>
</template>

<script>
import MenuBtn from './components/common/MenuBtn.vue';

export default {
	components: {
		MenuBtn
	},
	mounted() {}
};
</script>

<style lang="scss">
#app {
	position: relative;
	height: 100%;
	background: #f0f3f7;
}
</style>
