import { http } from '../http';

export function getModelListAPI() {
	return http.post('/dim/sys/getModelList');
}

export function test() {}
