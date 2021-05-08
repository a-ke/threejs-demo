<template>
	<div v-move class="menu-btn" :class="{ active: isActive }" @click.stop="">
		<span class="big-btn"></span>
		<span ref="iconBox" class="icon-box">
			<span
				v-for="menu in menuList"
				:key="menu.id"
				class="sys-icon"
				:class="menu.className"
				@click.stop="gotoSys(menu)"
			></span>
		</span>
	</div>
</template>

<script type="text/javascript">
import Hammer from 'hammerjs';
import { getModelListAPI } from '../../api/service/sys';

export default {
	name: 'MenuBtn',
	directives: {
		move: {
			inserted(el, binding, vNode) {
				const vm = vNode.context;
				const hammer = new Hammer(el);
				let mode = 'leftBottom';
				let oldX = parseFloat(getComputedStyle(el).left);
				let oldY = parseFloat(getComputedStyle(el).top);
				hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 0 });
				hammer.on('tap', () => {
					vm.isActive = !vm.isActive;
					const iconList = el.querySelectorAll('.sys-icon');
					let startAngle = 0; // 起始角度
					let r = 100; // 半径
					let allAngle = (Math.PI * 3) / 4; // 可显示区域，负数是为了改变方向
					switch (mode) {
						case 'left':
							startAngle = -((Math.PI * 2) / 5);
							r = 100;
							allAngle = (Math.PI * 4) / 5;
							break;
						case 'leftBottom':
							startAngle = -(Math.PI / 2);
							r = 120;
							allAngle = Math.PI / 2;
							break;
						case 'leftTop':
							startAngle = 0;
							r = 120;
							allAngle = Math.PI / 2;
							break;
						case 'right':
							startAngle = (-Math.PI * 3) / 5;
							r = 100;
							allAngle = -(Math.PI * 4) / 5;
							break;
						case 'rightBottom':
							startAngle = -Math.PI / 2;
							r = 120;
							allAngle = -Math.PI / 2;
							break;
						case 'rightTop':
							startAngle = -Math.PI;
							r = 120;
							allAngle = -Math.PI / 2;
							break;
						default:
							break;
					}
					for (let i = 0; i < iconList.length; i++) {
						if (vm.isActive) {
							iconList[i].style.opacity = '1';
							iconList[i].style.left = `${-22 + r * Math.cos(startAngle + (i * allAngle) / 4)}px`;
							iconList[i].style.top = `${-22 + r * Math.sin(startAngle + (i * allAngle) / 4)}px`;
						} else {
							iconList[i].style.opacity = '0';
							iconList[i].style.left = 0;
							iconList[i].style.top = 0;
						}
					}
				});
				hammer.on('panstart', () => {
					el.style.transition = 'unset';
					oldX = parseFloat(getComputedStyle(el).left);
					oldY = parseFloat(getComputedStyle(el).top);
				});
				hammer.on('pan', (e) => {
					let x = oldX + e.deltaX;
					let y = oldY + e.deltaY;
					const clientW = window.innerWidth - el.offsetWidth;
					const clientH = window.innerHeight - el.offsetHeight;
					if (x < 0) x = 0;
					if (y < 0) y = 0;
					if (x > clientW) x = clientW;
					if (y > clientH) y = clientH;
					el.style.left = `${x}px`;
					el.style.top = `${y}px`;
					if (vm.isActive) {
						vm.isActive = false;
						const iconList = el.querySelectorAll('.sys-icon');
						iconList.forEach((current) => {
							current.style.opacity = 0;
							current.style.top = 0;
							current.style.left = 0;
						});
					}
				});
				hammer.on('panend', () => {
					let x = parseFloat(el.style.left);
					const y = parseFloat(el.style.top);
					const clientW = window.innerWidth - el.offsetWidth;
					const clientH = window.innerHeight - el.offsetHeight;
					if (x > clientW / 2) {
						x = clientW;
					} else {
						x = 0;
					}
					el.style.left = `${x}px`;
					el.style.top = `${y}px`;
					el.style.transition = '0.2s all ease-in-out';
					setTimeout(() => {
						el.style.transition = '';
					}, 200);
					mode = '';
					if (x === 0) {
						mode += 'left';
						el.style.transform = 'translateX(-50%)';
					} else {
						mode += 'right';
						el.style.transform = 'translateX(50%)';
					}
					if (y < 100) {
						mode += 'Top';
					} else if (y > clientH - 100) {
						mode += 'Bottom';
					}
				});
			}
		}
	},
	data() {
		return {
			isActive: false,
			menuList: []
		};
	},
	mounted() {
		this.getModelList();
		document.addEventListener('click', this.documentClickHandler);
	},
	beforeDestroy() {
		document.removeEventListener('click', this.documentClickHandler);
	},
	methods: {
		gotoSys(menu) {
			if (menu.id !== 2) {
				window.location.href = menu.url;
			} else {
				window.open(menu.url, 'gis');
			}
		},
		documentClickHandler() {
			if (this.isActive) {
				this.isActive = false;
				const iconList = this.$refs.iconBox.querySelectorAll('.sys-icon');
				iconList.forEach((current) => {
					current.style.opacity = 0;
					current.style.top = 0;
					current.style.left = 0;
				});
			}
		},
		// 获取系统模块列表
		getModelList() {
			getModelListAPI()
				.then(({ data }) => {
					data.forEach((current) => {
						switch (current.id) {
							case 1:
								current.className = 'res';
								break;
							case 2:
								current.className = 'gis';
								break;
							case 3:
								current.className = 'knowledge';
								break;
							case 4:
								current.className = 'link';
								break;
							case 5:
								current.className = 'bim';
								break;
							default:
								current.className = 'gis';
								break;
						}
					});
					this.menuList = data;
				})
				.catch((data) => {
					if (data.message) {
						this.$message.error(data.message);
					}
				});
		}
	}
};
</script>

<style lang="scss" scoped>
.menu-btn {
	position: fixed;
	left: 0;
	top: calc(100% - 78px);
	z-index: 9999;
	transform: translateX(-50%);
	transition: 0.2s all ease-in-out;
	.big-btn {
		position: relative;
		display: inline-block;
		width: 78px;
		height: 78px;
		background: #272b35 url('../../assets/images/menu _icon.png') 16px 17px / 46px 46px no-repeat;
		opacity: 0.8;
		border-radius: 50%;
		cursor: pointer;
		z-index: 1;
		&::after {
			position: absolute;
			z-index: -1;
			content: '';
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			background: #fff;
			border: 1px solid #4d8dfe;
			opacity: 0.1;
			border-radius: 50%;
			transition: 0.2s all ease-in-out;
		}
		&:hover {
			&::after {
				left: -25%;
				top: -25%;
				width: 150%;
				height: 150%;
			}
		}
	}
	&:hover {
		transform: unset !important;
	}
	&.active {
		transform: unset !important;
		.big-btn::after {
			left: -25%;
			top: -25%;
			width: 150%;
			height: 150%;
		}
	}
	.icon-box {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 0;
		height: 0;
	}
	.sys-icon {
		opacity: 0;
		position: absolute;
		left: 0;
		top: 0;
		width: 44px;
		height: 44px;
		background-size: 26px 26px;
		background-position: 9px 9px;
		background-repeat: no-repeat;
		border-radius: 50%;
		cursor: pointer;
		transition: 0.2s all ease-in-out;
		&::after {
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			content: '';
			z-index: -1;
			background: #272b35;
			opacity: 0.8;
			border-radius: 50%;
		}
		&.res {
			background-image: url('../../assets/images/res_white.png');
		}
		&.gis {
			background-image: url('../../assets/images/gis_white.png');
		}
		&.knowledge {
			background-image: url('../../assets/images/knowledge_white.png');
		}
		&.link {
			background-image: url('../../assets/images/link_white.png');
		}
		&.bim {
			background-image: url('../../assets/images/bim_white.png');
		}
		&:hover {
			&::after {
				background: linear-gradient(to top, #015eea, #00e5fa);
			}
		}
	}
}
</style>
