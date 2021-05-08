import { http } from '../http';

/**
 * @description 获取设备的实时指标
 * @param {Array} ids 设备id列表
 * @returns {Promise}
 */
export function getCollectDeviceInfoByIdsAPI(ids) {
	return http.post('/iot/gateway/getCollectDeviceInfoByIds', { ids });
}

/**
 * @description 获取设备详情
 * @param {Array} ids 设备id
 * @returns {Promise}
 */
export function getCameraListAPI(ids) {
	const res = [];
	ids.forEach((id) => {
		res.push(http.post('/rim-rs/rs/getResourceDetail', { id }));
	});
	return Promise.all(res);
}

/**
 * @description 获取指定设备的信息
 * @param {Array} ids 设备id列表
 * @returns {Promise}
 */
export function getDeviceByIdsAPI(ids) {
	return http.post('/rim-rs/rs/device/getDeviceByIds', { ids });
}
