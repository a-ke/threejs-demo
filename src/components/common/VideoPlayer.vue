<template>
	<video
		ref="videoPlayer"
		class="video-js vjs-big-play-centered vjs-fluid"
		:poster="options.poster"
	></video>
</template>

<script type="text/javascript">
/*
 * sources.type 参数说明：rtmp：rtmp/flv；hls：application/x-mpegURL，flv：video/flv
 */
export default {
	name: 'VideoPlayer',
	props: {
		options: {
			type: Object,
			default() {
				return {};
			}
		}
	},
	data() {
		return {
			player: null,
			defaultOptions: {
				autoplay: true,
				controls: true,
				language: 'zh-CN',
				liveui: false,
				techOrder: ['html5', 'flvjs'],
				muted: false,
				flvjs: {
					mediaDataSource: {
						isLive: true,
						cors: true,
						withCredentials: false
					},
					config: {
						enableWorker: true,
						enableStashBuffer: false,
						stashInitialSize: 128
					} // flv直播优化
				},
				controlBar: {
					pictureInPictureToggle: false,
					volumePanel: {
						inline: false
					}
				}
			}
		};
	},
	watch: {
		'options.sources': {
			handler(val, oldVal) {
				if (val.length === 0) {
					this.player.dispose();
					return;
				}
				if (oldVal.length === 0) {
					this.playerInit();
					return;
				}
				if (val[0].src !== oldVal[0].src) {
					this.player.src(val);
				}
			},
			deep: true
		}
	},
	mounted() {
		this.playerInit();
	},
	beforeDestroy() {
		if (this.player) {
			this.player.dispose();
		}
	},
	methods: {
		playerInit() {
			const vm = this;
			if (!this.options.sources || this.options.sources.length === 0) {
				console.log('播放器的视频地址为空！');
				return;
			}
			this.player = videojs(
				this.$refs.videoPlayer,
				{ ...this.defaultOptions, ...this.options },
				function onPlayerReady() {
					const options = this.options();
					if (options.muted) {
						this.muted(true);
					}
					if (options.autoplay === true || options.autoplay === 'any') {
						// 如果是自动播放，则做些兼容处理，谷歌浏览器有自动播放的限制
						const promise = this.play();
						if (promise !== undefined) {
							promise
								.then(() => {})
								.catch(() => {
									// 播放失败后，尝试静音播放
									this.autoplay('muted');
								});
						}
					}
					// 如果有设置起始播放时间点,则从设置位置开始播放,否则从头播放;
					if (vm.options.currentTime) {
						this.currentTime(vm.options.currentTime);
					}
				}
			);
			// 禁掉右击菜单
			this.player.on('contextmenu', function(e) {
				e.preventDefault();
			});
			this.player.on('play', function() {
				// flv直播暂停后恢复播放，取最新的数据，保证直播的实时性
				if (this.currentSource().type === 'video/flv') {
					if (this.bufferedEnd() - this.currentTime() > 1) {
						this.currentTime(this.bufferedEnd() - 1);
					}
				}
			});
			this.player.on('timeupdate', () => {
				// 当前播放时长(秒)
				const currentTime = this.$refs.videoPlayer.currentTime;
				const duration = this.$refs.videoPlayer.duration;
				this.$emit('timeupdate', { currentTime, duration });
			});
			this.player.on('playing', () => {
				this.$emit('playing');
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.video-player,
.video-js {
	width: 100%;
	height: 100%;
}
</style>
