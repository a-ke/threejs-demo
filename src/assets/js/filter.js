import Vue from 'vue';
import dayjs from 'dayjs';

/* 时间格式化 */
Vue.filter('formatTime', (value, fmt = 'YYYY-MM-DD HH:mm:ss') => {
	if (!value) {
		return '未知';
	}
	return dayjs(value).format(fmt);
});

/* 文件图标 */
Vue.filter('fileIcon', (value) => {
	let icon;
	switch (value) {
		case 'Word':
			icon = 'word';
			break;
		case 'Ppt':
			icon = 'ppt';
			break;
		case 'Excel':
			icon = 'excel';
			break;
		case 'Pdf':
			icon = 'pdf';
			break;
		case '其他':
			icon = 'other';
			break;
		default:
			icon = 'other';
			break;
	}
	return icon;
});
