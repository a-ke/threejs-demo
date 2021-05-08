/* eslint-disable no-param-reassign */
import axios from 'axios';
import { Message } from 'element-ui';

const baseUrl = '';

const http = axios.create({
	baseURL: baseUrl,
	timeout: 30000,
	transformRequest: [
		function(data) {
			return JSON.stringify(data);
		}
	]
});

// http request 拦截器
http.interceptors.request.use(
	(config) => {
		config.headers = {
			'Content-Type': 'application/json'
		};
		return config;
	},
	(err) => {
		return Promise.reject(err);
	}
);

// http response 拦截器
http.interceptors.response.use(
	(response) => {
		if (response.status < 400) {
			if (response.data.code === 0) {
				return Promise.resolve(response.data);
			}
			if (response.data.code === 302) {
				window.location.href = response.data.data;
			}
			return Promise.reject(response.data);
		}
		Message.error('网络故障');
		return Promise.reject();
	},
	() => {
		Message.error('网络故障');
		return Promise.reject();
	}
);

export { baseUrl, http };
