<template>
	<div id="Tower3D" class="tower-3d">
		<div class="header" :name="`博汇指挥所${floorName ? `-${floorName}` : ''}`"></div>
		<div id="container"></div>
		<div v-if="currentMenu === 'camera'" class="play-box">
			<template v-for="(player, index) in playUrlList">
				<div v-if="showPlayers.includes(index)" :key="index" style="display: none">
					<video-player
						:id="'player-' + index"
						:options="{
							controls: false,
							muted: true,
							sources: [
								{
									src: player.url,
									type: getSourceType(player.url)
								}
							]
						}"
					></video-player>
				</div>
			</template>
		</div>
		<transition name="bounce">
			<ul v-if="menuVisible" class="menu-box">
				<li class="menu-item louyu" @click.stop="showHome">大楼全景</li>
				<li
					class="menu-item home"
					:class="{ active: currentMenu === 'area' }"
					@click.stop="switchRes('area')"
				>
					空间区域
				</li>
				<li
					class="menu-item huanjing"
					:class="{ active: currentMenu === 'environment' }"
					@click.stop="switchRes('environment')"
				>
					环境监测
				</li>
				<li
					class="menu-item camera"
					:class="{ active: currentMenu === 'camera' }"
					@click.stop="switchRes('camera')"
				>
					视频监控
				</li>
			</ul>
		</transition>
	</div>
</template>

<script type="text/javascript">
import VideoPlayer from '@/components/common/VideoPlayer';
import {
	init,
	switchShow,
	updateCameraCanvas,
	updateEnvironmentCanvas
} from '../assets/js/tower3D';
import {
	getCameraListAPI,
	getCollectDeviceInfoByIdsAPI,
	getDeviceByIdsAPI
} from '../api/service/tower';

export default {
	name: 'Tower3D',
	components: { VideoPlayer },
	data() {
		return {
			menuVisible: false,
			floorName: '',
			currentMenu: 'area',
			playUrlList: [],
			showPlayers: [],
			airDeviceList: [], // 空气质量检测仪设备列表
			timer: null
		};
	},
	mounted() {
		init(this);
		this.$on('showFloor', (name) => {
			this.floorName = name;
			this.menuVisible = true;
		});
		this.$on('cameraShow', (i) => {
			// 摄像头信息显示
			this.showPlayers.push(i);
		});
		this.$on('cameraHidden', (i) => {
			// 摄像头信息隐藏
			this.showPlayers.splice(this.showPlayers.indexOf(i), 1);
		});
		this.getCameraList();
		this.getDeivcesInfo();
	},
	beforeDestroy() {
		window.clearTimeout(this.getAirList.timer);
		window.cancelAnimationFrame(this.timer);
	},
	methods: {
		getSourceType(url) {
			if (/^rtmp\S+/.test(url)) {
				return 'rtmp/flv';
			}
			if (url.includes('.flv')) {
				return 'video/flv';
			}
			if (url.includes('.m3u8')) {
				return 'application/x-mpegURL';
			}
			if (url.includes('.mp4')) {
				return 'video/mp4';
			}
			return 'video/mp4';
		},
		// 回到大楼整体
		showHome() {
			switchShow('all');
			this.menuVisible = false;
			this.floorName = '';
			this.currentMenu = 'area';
		},
		// 展示各种资源，area:空间区域，environment:环境监测，camera:视频监控
		switchRes(type) {
			if (this.currentMenu === type) return;
			this.currentMenu = type;
			clearTimeout(this.getAirList.timer);
			window.cancelAnimationFrame(this.timer);
			if (type === 'camera') {
				this.updateVideo();
				this.showPlayers = [];
			} else if (type === 'environment') {
				this.getAirList();
			}
			switchShow(type);
		},
		// 获取空气质量检测仪的实时数据
		getAirList() {
			clearTimeout(this.getAirList.timer);
			getCollectDeviceInfoByIdsAPI(dataConfig.airList).then(({ data }) => {
				const len = data.length;
				if (len < 5) {
					for (let i = 0; i < 5 - len; i++) {
						data.push(JSON.parse(JSON.stringify(data[0])));
					}
				}
				data.forEach((current, index) => {
					const device = this.airDeviceList.find((el) => el.id === current.id);
					current.name = device ? device.name : '空气质量检测仪';
					updateEnvironmentCanvas(current, index);
				});
				this.getAirList.timer = setTimeout(() => {
					this.getAirList();
				}, 1000);
			});
		},
		// 获取摄像头的详情
		getCameraList() {
			getCameraListAPI(dataConfig.cameraList).then((resList) => {
				resList.forEach((current) => {
					try {
						this.playUrlList.push({ title: current.data.name, url: current.data.streamUrl });
					} catch (error) {
						console.error(error);
					}
				});
			});
		},
		// 获取空气质量检测仪的信息
		getDeivcesInfo() {
			getDeviceByIdsAPI(dataConfig.airList)
				.then(({ data }) => {
					this.airDeviceList = data;
				})
				.catch((err) => {
					if (err) {
						this.$message.error(err.message);
					}
				});
		},
		updateVideo() {
			this.playUrlList.forEach((current, index) => {
				updateCameraCanvas(index, current.title);
			});
			this.timer = window.requestAnimationFrame(this.updateVideo);
		}
	}
};
</script>

<style lang="scss" scoped>
.tower-3d {
	position: relative;
	width: 100%;
	height: 100%;
	background: url('../assets/images/bg.png') 0 0 / 100% 100% no-repeat;
	overflow: hidden;
	.header {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 92px;
		background: url('../assets/images/titleBgImg.png') 0 0 / 100% auto no-repeat;
		&::before {
			position: absolute;
			left: 50%;
			top: 0;
			// width: 100%;
			height: 80px;
			line-height: 80px;
			font-size: 32px;
			color: #00f4fd;
			content: attr(name);
			text-align: center;
			letter-spacing: 5px;
			transform: translateX(-50%);
		}
	}
	.menu-box {
		position: absolute;
		left: 0;
		bottom: 63px;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		.menu-item {
			position: relative;
			width: 156px;
			height: 96px;
			margin: 0 15px;
			padding-top: 55px;
			line-height: 28px;
			background: url('../assets/images/btn.png') 0 0 / 100% 100%;
			cursor: pointer;
			color: #00e6fe;
			font-size: 18px;
			text-align: center;
			&:hover,
			&.active {
				background-image: url('../assets/images/btn-active.png');
				color: #fff;
			}
			&::before {
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 55px;
				content: '';
				background-position: center 11px;
				background-size: auto;
				background-repeat: no-repeat;
			}
			@each $img in louyu, home, huanjing, camera {
				&.#{$img}::before {
					background-image: url('../assets/images/#{$img}-icon.png');
				}
				&.#{$img}:hover::before,
				&.#{$img}.active::before {
					background-image: url('../assets/images/#{$img}-icon-active.png');
				}
			}
		}
	}
}
</style>
