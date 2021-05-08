import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import Hammer from 'hammerjs';
import areaCardImage from '../images/areaCard.png';
import environmentImage from '../images/environmentCard.png';
import cameraImage from '../images/cameraCard.png';

let camera;
let scene;
let renderer;
let control;
let clock;
let raycaster;
let group;
let vm; // vue实例
let areaCardImageEl;
let environmentImageEl;
let cameraImageEl;
let isDetail = false; // 是否是楼层详情
const cardList = []; // 卡片模型列表
const mouse = { x: 0, y: 0 };
const modelList = [
	'4号楼楼体-一层',
	'4号楼楼体-二层',
	'4号楼楼体-三层',
	'4号楼楼体-四层',
	'4号楼楼体-五层',
	'感应器',
	'摄像头'
];
const areaList = [
	{
		width: 8.9,
		height: 8.6,
		x: -22,
		y: 3.4,
		z: 4.3,
		text: '战备资料室',
		color: 0x58ff6c
	},
	{
		width: 5.7,
		height: 6,
		x: -18.9,
		y: 3.4,
		z: 14.8,
		text: '作战值班室',
		color: 0x58ff6c
	},
	{
		width: 4.5,
		height: 9,
		x: 2.2,
		y: 3.4,
		z: 4.5,
		text: '有线通信室',
		color: 0x58ff6c
	},
	{
		width: 4.5,
		height: 9,
		x: 6.7,
		y: 3.4,
		z: 4.5,
		text: '天线通信室',
		color: 0x58ff6c
	},
	{
		width: 6.5,
		height: 6,
		x: 3.3,
		y: 3.4,
		z: 14.8,
		text: '作战指挥大厅',
		color: 0x02b8f8
	},
	{
		width: 2.1,
		height: 6,
		x: 7.6,
		y: 3.4,
		z: 14.8,
		text: '大厅控制室',
		color: 0x02b8f8
	},
	{
		width: 4.4,
		height: 4.2,
		x: 2.2,
		y: 3.4,
		z: 19.9,
		text: '指挥控制中心',
		color: 0x02b8f8
	},
	{
		width: 4.4,
		height: 4.2,
		x: 6.6,
		y: 3.4,
		z: 19.9,
		text: '综合保障部',
		color: 0x02b8f8
	},
	{
		width: 4.4,
		height: 4.5,
		x: 2.2,
		y: 3.4,
		z: 24.3,
		text: '情报信息部',
		color: 0x02b8f8
	},
	{
		width: 4.4,
		height: 4.5,
		x: 6.6,
		y: 3.4,
		z: 24.3,
		text: '政治工作部',
		color: 0x02b8f8
	},
	{
		width: 5.3,
		height: 8.5,
		x: 32.5,
		y: 3.4,
		z: 4.3,
		text: '空清标图室',
		color: 0x58ff6c
	},
	{
		width: 6.7,
		height: 4.3,
		x: 40.5,
		y: 3.4,
		z: 19.9,
		text: '空调机房',
		color: 0x6d4700
	},
	{
		width: 6.7,
		height: 4.5,
		x: 40.5,
		y: 3.4,
		z: 24.3,
		text: '排风机房',
		color: 0x6d4700
	}
];
const environmentList = [
	{
		x: -26.3,
		y: 2,
		z: 11
	},
	{
		x: -0.2,
		y: 2,
		z: 5.9
	},
	{
		x: 8.9,
		y: 2,
		z: 20.5
	},
	{
		x: 32,
		y: 2,
		z: 4.4
	},
	{
		x: 43.8,
		y: 2,
		z: 24
	}
];
const cameraList = [
	{
		x: -27.8,
		y: 2.5,
		z: 17.5
	},
	{
		x: -18,
		y: 2.5,
		z: 8.4
	},
	{
		x: 8.4,
		y: 2.5,
		z: 8.5
	},
	{
		x: 28.5,
		y: 2.5,
		z: 7.5
	}
];

// 让模型居中
// function setCenter(object) {
// 	object.updateMatrixWorld();
// 	const box = new THREE.Box3().setFromObject(object);
// 	const boxSize = box.getSize();
// 	const center = box.getCenter(new THREE.Vector3());
// 	object.position.x += object.position.x - center.x;
// 	object.position.y += object.position.y - center.y; // 修改center.y可以设置模型整体上下偏移
// 	object.position.z += object.position.z - center.z;
// 	camera.position.copy(center);
// 	if (boxSize.x > boxSize.y) {
// 		camera.position.z = boxSize.x * -2.85;
// 	} else {
// 		camera.position.z = boxSize.y * -2.85;
// 	}
// 	camera.lookAt(0, 0, 0);
// }

// 初始化函数
async function init(that) {
	vm = that;
	areaCardImageEl = await loadImages(areaCardImage);
	environmentImageEl = await loadImages(environmentImage);
	cameraImageEl = await loadImages(cameraImage);

	scene = new THREE.Scene(); // 创建场景
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000); // 创建摄像机
	camera.name = '摄像机';
	camera.position.set(20, 30, 70);
	scene.add(camera);

	const ambientLight = new THREE.AmbientLight(0xffffff, 1); // 环境光
	scene.add(ambientLight);
	const directional = new THREE.DirectionalLight(0xffffff, 1);
	directional.position.set(1, 1, 0);
	scene.add(directional);
	const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
	scene.add(light);

	group = new THREE.Group();
	group.name = '模型组';
	group.position.z -= 13; // 将模型的原点放到中间
	scene.add(group);

	// 加载模型
	modelList.slice(0, 5).forEach((current) => {
		loadModel(current);
	});
	raycaster = new THREE.Raycaster();
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // antialias:true开启抗锯齿
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	control = new OrbitControls(camera, renderer.domElement);
	control.target = new THREE.Vector3(0, 0, 0); // 控制焦点
	// control.autoRotate = true;//将自动旋转关闭
	clock = new THREE.Clock(); // 用于更新轨道控制器
	document.getElementById('container').appendChild(renderer.domElement);

	window.addEventListener('resize', onWindowResize, false);
	const hammer = new Hammer(document.getElementById('container'));
	hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 0 });
	hammer.on('tap', (e) => {
		onMouseClick(e.srcEvent);
		e.srcEvent.stopPropagation();
		e.srcEvent.preventDefault();
	});

	if (process.env.NODE_ENV === 'development') {
		// 谷歌调试使用
		window.scene = scene;
		window.THREE = THREE;
	}

	animate();
}

// 加载图片
function loadImages(src) {
	return new Promise((resolve) => {
		const img = new Image();
		img.src = src;
		img.onload = function() {
			resolve(img);
		};
	});
}

// 加载模型
function loadModel(modelName, parent = group) {
	const onProgress = function(xhr) {
		if (xhr.lengthComputable) {
			const percentComplete = (xhr.loaded / xhr.total) * 100;
			console.log(`${Math.round(percentComplete, 2)}% downloaded`);
		}
	};
	const onError = function() {};
	new MTLLoader().setPath('./static/model/').load(`${modelName}.mtl`, function(materials) {
		materials.preload();
		new OBJLoader()
			.setMaterials(materials)
			.setPath('./static/model/')
			.load(
				`${modelName}.obj`,
				function(object) {
					object.traverse(function(child) {
						if (child instanceof THREE.Mesh) {
							// console.log(child);
						}
					});
					object.name = modelName;
					if (modelName === modelList[1]) {
						// 绘制二层的区域信息
						parent = object;
						const tempGroup = new THREE.Group();
						tempGroup.visible = false;
						tempGroup.name = '区域信息组';
						parent.add(tempGroup);
						createArea(tempGroup);
						// 加载环境设备
						loadModel(modelList[5], parent);
						// 加载摄像头
						loadModel(modelList[6], parent);
					} else if (modelName === modelList[5]) {
						// 空气质量监测仪
						const tempGroup = new THREE.Group();
						tempGroup.name = '环境监测组';
						tempGroup.visible = false;
						parent.add(tempGroup);
						createEnvironment(tempGroup, object);
					} else if (modelName === modelList[6]) {
						// 摄像头
						const tempGroup = new THREE.Group();
						tempGroup.name = '视频监控组';
						tempGroup.visible = false;
						parent.add(tempGroup);
						createCamera(tempGroup, object);
					}
					if (modelList.indexOf(modelName) < 5) {
						parent = group;
						parent.add(object);
					}
				},
				onProgress,
				onError
			);
	});
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseClick(event) {
	// 通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.

	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	// 通过鼠标点的位置和当前相机的矩阵计算出raycaster
	raycaster.setFromCamera(mouse, camera);

	// 获取raycaster直线和所有模型相交的数组集合
	// 第一个参数是用来检测和射线相交的物体
	// 第二个参数如果为true，它会检查所有后代。否则只检查该对象本身。缺省默认值为false
	const intersects = raycaster.intersectObjects(group.children, true);

	if (intersects.length > 0) {
		const obj = intersects[0].object;
		if (obj.parent.name === modelList[1]) {
			if (isDetail) return;
			group.children.forEach((current) => {
				if (current.uuid === obj.parent.uuid) {
					current.visible = true;
					vm.$emit('showFloor', current.name.split('-')[1]);
				} else {
					current.visible = false;
				}
			});

			// 摄像机动画
			control.saveState();
			new TWEEN.Tween(camera.position)
				.to(
					{
						x: 5.88,
						y: 42.51,
						z: 49.7
					},
					1000
				)
				.easing(TWEEN.Easing.Quadratic.Out)
				.start()
				.onComplete(() => {
					isDetail = true;
					switchShow('area');
				});
		} else if (obj.parent.name.startsWith('摄像头')) {
			try {
				let cardGroup;
				if (/^摄像头\d+卡片组$/.test(obj.parent.name)) {
					cardGroup = obj.parent;
				} else {
					cardGroup = obj.parent.parent.children.find(
						(current) => current.name === `${obj.parent.name}卡片组`
					);
				}
				const visible = cardGroup.children.find((current) => current.name === '监控视频').visible;
				switchCameraVideo(cardGroup, !visible);
				if (!visible) {
					vm.$emit('cameraShow', Number(cardGroup.name.match(/\d+/)[0]));
				} else {
					vm.$emit('cameraHidden', Number(cardGroup.name.match(/\d+/)[0]));
				}
			} catch (error) {
				// error
			}
		}
	}
}

// 切换显示
function switchShow(type) {
	try {
		const groupNameList = ['区域信息组', '环境监测组', '视频监控组'];
		const floorObj = group.children.find((current) => current.name === modelList[1]);
		for (let i = 0; i < floorObj.children.length; i++) {
			const current = floorObj.children[i];
			if (groupNameList.includes(current.name)) {
				current.visible = false;
			}
		}
		if (type === 'all') {
			group.children.forEach((current) => {
				current.visible = true;
			});
			new TWEEN.Tween(camera.position)
				.to(control.position0, 1000)
				.easing(TWEEN.Easing.Quadratic.Out)
				.start()
				.onComplete(() => {
					isDetail = false;
				});
		} else {
			for (let i = 0; i < floorObj.children.length; i++) {
				const current = floorObj.children[i];
				if (
					(type === 'area' && current.name === groupNameList[0]) ||
					(type === 'environment' && current.name === groupNameList[1]) ||
					(type === 'camera' && current.name === groupNameList[2])
				) {
					current.children.forEach((child) => {
						if (child.name.endsWith('卡片组')) {
							const position = child.position;
							position.y += 5;
							new TWEEN.Tween(position)
								.to({ y: position.y - 5 }, 1000)
								.easing(TWEEN.Easing.Quadratic.Out)
								.start();
						}
					});
					// 显示当前模块
					current.visible = true;
				}
				if (type === 'camera' && current.name === groupNameList[1]) {
					// 每次切换到视频监控时，只显示第一个监控画面
					cardList.forEach((el) => {
						if (/摄像头\d+卡片组/.test(el.name)) {
							switchCameraVideo(el, false);
							// if (el.name !== '摄像头0卡片组') {
							// 	el.visible = false;
							// } else {
							// 	el.visible = true;
							// }
						}
					});
				}
			}
		}
	} catch (error) {
		console.error(error);
	}
}

// 创建区域信息
function createArea(tempGroup) {
	areaList.forEach((current) => {
		// 区域上方的蒙层
		const geometry = new THREE.BoxGeometry(current.width, 0.1, current.height);
		const material = new THREE.MeshBasicMaterial({
			color: current.color,
			opacity: 0.6,
			transparent: true
		});
		const cube = new THREE.Mesh(geometry, material);
		cube.name = current.text;

		cube.position.set(current.x, current.y, current.z);
		tempGroup.add(cube);

		const cardGroup = new THREE.Group();
		tempGroup.add(cardGroup);
		cardGroup.name = `${cube.name}卡片组`;
		// 三角锥标志
		const triangleGeo = new THREE.ConeGeometry(0.4, 0.8, 3);
		const triangleMaterial = new THREE.MeshBasicMaterial({
			color: 0x00e6fe,
			opacity: 0.6,
			transparent: true
		});
		const triangle = new THREE.Mesh(triangleGeo, triangleMaterial);
		triangle.position.set(current.x, current.y + 1, current.z);
		triangle.rotation.x = Math.PI;
		cardGroup.add(triangle);

		const edges = new THREE.EdgesGeometry(triangleGeo);
		const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00e6fe }));
		line.position.set(triangle.position.x, triangle.position.y, triangle.position.z);
		line.rotation.x = triangle.rotation.x;
		cardGroup.add(line);

		// 区域文字牌
		const textGeo = new THREE.PlaneGeometry(1.49 * 4, 0.58 * 4);
		const texture = new THREE.CanvasTexture(drawAreaCanvas(current.text));
		// 为了解决贴图上文字模糊
		texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

		const planeMaterial = new THREE.MeshBasicMaterial({ transparent: true, map: texture });
		planeMaterial.side = THREE.DoubleSide; // 双面;
		const text = new THREE.Mesh(textGeo, planeMaterial);
		text.position.set(current.x, current.y + 2.5, current.z);
		text.name = '区域信息';
		cardGroup.add(text);
		cardList.push(cardGroup);
	});
}

// 绘制区域信息的canvas
function drawAreaCanvas(text) {
	const canvas = document.createElement('canvas');
	canvas.width = 1490;
	canvas.height = 580;
	const ctx = canvas.getContext('2d');
	const img = areaCardImageEl;
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	drawText(ctx, text, 1490 / 2, 30, 1490, 18 * 10, '#ffffff', 'center');
	return canvas;
}

// 创建环境监测设备以及指标
function createEnvironment(tempGroup, object) {
	object.rotation.z = Math.PI / 2;
	object.scale.set(0.3, 0.3, 0.3);
	environmentList.forEach((current, index) => {
		// 设备模型
		const cloneObj = object.clone();
		cloneObj.name = `环境指标${index}`;
		switch (index) {
			case 0:
				cloneObj.rotation.z += Math.PI;
				break;
			case 2:
				cloneObj.rotation.z += Math.PI;
				break;
			case 3:
				cloneObj.rotation.z = 0;
				cloneObj.rotation.x = Math.PI / 2;
				break;
			default:
				break;
		}
		cloneObj.position.set(current.x, current.y, current.z);
		tempGroup.add(cloneObj);

		const cardGroup = new THREE.Group();
		cardGroup.name = `${cloneObj.name}卡片组`;
		tempGroup.add(cardGroup);

		// 三角锥标志
		const triangleGeo = new THREE.ConeGeometry(0.4, 0.8, 3);
		const triangleMaterial = new THREE.MeshBasicMaterial({
			color: 0x00e6fe,
			opacity: 0.6,
			transparent: true
		});
		const triangle = new THREE.Mesh(triangleGeo, triangleMaterial);
		triangle.position.set(current.x, current.y + 2, current.z);
		triangle.rotation.x = Math.PI;
		cardGroup.add(triangle);

		const edges = new THREE.EdgesGeometry(triangleGeo);
		const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00e6fe }));
		line.position.set(triangle.position.x, triangle.position.y, triangle.position.z);
		line.rotation.x = triangle.rotation.x;
		cardGroup.add(line);

		// 环境指标卡片
		const textGeo = new THREE.PlaneGeometry(3.51 * 4, 2.28 * 4);

		const canvas = drawEnvironmentCanvas();
		const texture = new THREE.CanvasTexture(canvas);
		// 为了解决贴图上文字模糊
		texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

		const planeMaterial = new THREE.MeshBasicMaterial({ transparent: true, map: texture });
		planeMaterial.side = THREE.DoubleSide; // 双面;
		const text = new THREE.Mesh(textGeo, planeMaterial);
		text.position.set(current.x, current.y + 7.5, current.z);
		text.name = `环境指标_${index}`;
		cardGroup.add(text);
		cardList.push(cardGroup);
	});
}

// 绘制环境指标的canvas
function drawEnvironmentCanvas(info) {
	const canvas = document.createElement('canvas');
	const multiple = 4;
	canvas.width = 351 * multiple;
	canvas.height = 228 * multiple;
	const ctx = canvas.getContext('2d');
	const img = environmentImageEl;
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	if (info) {
		// pm2.5
		drawText(
			ctx,
			info.pm25,
			85 * multiple,
			50 * multiple,
			70 * multiple,
			18 * multiple,
			'#ffffff',
			'center'
		);
		// 温度
		drawText(
			ctx,
			`${info.temp}℃`,
			260 * multiple,
			21 * multiple,
			62 * multiple,
			16 * multiple,
			'#ffffff',
			'center'
		);
		// 湿度
		drawText(
			ctx,
			`${info.humidity}%`,
			260 * multiple,
			62 * multiple,
			60 * multiple,
			16 * multiple,
			'#ffffff',
			'center'
		);
		// 二氧化碳
		drawText(
			ctx,
			`${info.co2} ppm`,
			30 * multiple,
			135 * multiple,
			100 * multiple,
			16 * multiple,
			'#ffffff'
		);
		// 甲醛
		drawText(
			ctx,
			`${info.hcho} mg/m³`,
			142.3 * multiple,
			135 * multiple,
			100 * multiple,
			16 * multiple,
			'#ffffff'
		);
		// TVOC
		drawText(
			ctx,
			`${info.tvoc} mg/m³`,
			240 * multiple,
			135 * multiple,
			100 * multiple,
			16 * multiple,
			'#ffffff'
		);
		// 标题
		drawText(
			ctx,
			info.name,
			25 * multiple,
			176 * multiple,
			300 * multiple,
			16 * multiple,
			'#ffffff'
		);
	}
	return canvas;
}

// 更新环境指标卡片
function updateEnvironmentCanvas(info, index) {
	cardList.forEach((current) => {
		if (current.name === `环境指标${index}卡片组`) {
			const card = current.children.find((el) => /环境指标_\d+/.test(el.name));
			const canvas = drawEnvironmentCanvas(info);
			const texture = new THREE.Texture(canvas);

			// 为了解决贴图上文字模糊
			const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
			texture.anisotropy = maxAnisotropy;

			const planeMaterial = new THREE.MeshBasicMaterial({ transparent: true, map: texture });
			planeMaterial.side = THREE.DoubleSide; // 双面;
			card.material = planeMaterial;
			card.material.map.needsUpdate = true;
		}
	});
}

// 创建摄像头
function createCamera(tempGroup, object) {
	object.scale.set(0.03, 0.03, 0.03);
	cameraList.forEach((current, index) => {
		const cloneObj = object.clone();
		cloneObj.name = `摄像头${index}`;
		cloneObj.position.set(current.x, current.y, current.z);
		tempGroup.add(cloneObj);

		const cardGroup = new THREE.Group();
		cardGroup.name = `${cloneObj.name}卡片组`;
		tempGroup.add(cardGroup);

		// 三角锥标志
		const triangleGeo = new THREE.ConeGeometry(0.4, 0.8, 3);
		const triangleMaterial = new THREE.MeshBasicMaterial({
			color: 0x00e6fe,
			opacity: 0.6,
			transparent: true
		});
		const triangle = new THREE.Mesh(triangleGeo, triangleMaterial);
		triangle.position.set(current.x + 1, current.y + 2, current.z - 0.2);
		triangle.rotation.x = Math.PI;
		cardGroup.add(triangle);

		const edges = new THREE.EdgesGeometry(triangleGeo);
		const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00e6fe }));
		line.position.set(triangle.position.x, triangle.position.y, triangle.position.z);
		line.rotation.x = triangle.rotation.x;
		cardGroup.add(line);

		// 监控名称
		const titleGeo = new THREE.PlaneGeometry(1.49 * 4, 0.58 * 4);
		const titleTexture = new THREE.CanvasTexture(drawAreaCanvas('摄像头'));
		// 为了解决贴图上文字模糊
		titleTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
		const titlePlaneMaterial = new THREE.MeshBasicMaterial({
			transparent: true,
			map: titleTexture
		});
		titlePlaneMaterial.side = THREE.DoubleSide; // 双面;
		const title = new THREE.Mesh(titleGeo, titlePlaneMaterial);
		title.position.set(current.x + 1, current.y + 4, current.z - 0.2);
		title.name = '摄像头名称';
		cardGroup.add(title);

		// 监控视频卡片
		const textGeo = new THREE.PlaneGeometry(2.94 * 4, 2.06 * 4);

		const texture = new THREE.CanvasTexture(drawCameraCanvas('监控视频'));
		// 为了解决贴图上文字模糊
		texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

		const planeMaterial = new THREE.MeshBasicMaterial({ transparent: true, map: texture });
		planeMaterial.side = THREE.DoubleSide; // 双面;
		const text = new THREE.Mesh(textGeo, planeMaterial);
		text.position.set(current.x + 1, current.y + 7, current.z - 0.2);
		text.name = '监控视频';
		cardGroup.add(text);
		cardList.push(cardGroup);
	});
}

// 绘制摄像机画面的canvas
function drawCameraCanvas(title, video) {
	const canvas = document.createElement('canvas');
	const multiple = 2;
	canvas.width = 294 * multiple;
	canvas.height = 206 * multiple;
	const ctx = canvas.getContext('2d');
	const img = cameraImageEl;
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	if (video) {
		ctx.drawImage(
			video,
			9 * multiple,
			1 * multiple,
			canvas.width - 18 * multiple,
			canvas.height - 51 * multiple
		);
	}
	drawText(ctx, title, 20 * multiple, 155 * multiple, 200 * multiple, 16 * multiple, '#ffffff');
	return canvas;
}

// 更新摄像机卡片
function updateCameraCanvas(index, title) {
	const video = document.querySelector(`#player-${index} video`);
	cardList.forEach((current) => {
		if (current.name === `摄像头${index}卡片组`) {
			const card = current.children.find((el) => el.name === '监控视频');
			if (card.visible) {
				// 更新画面卡片
				const texture = new THREE.Texture(drawCameraCanvas(title, video));

				// 为了解决贴图上文字模糊
				const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
				texture.anisotropy = maxAnisotropy;

				const planeMaterial = new THREE.MeshBasicMaterial({ transparent: true, map: texture });
				planeMaterial.side = THREE.DoubleSide; // 双面;
				card.material = planeMaterial;
				card.material.map.needsUpdate = true;
			} else {
				// 更新标题卡片
				const titleCard = current.children.find((el) => el.name === '摄像头名称');
				const texture = new THREE.Texture(drawAreaCanvas(title));

				// 为了解决贴图上文字模糊
				const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
				texture.anisotropy = maxAnisotropy;

				const planeMaterial = new THREE.MeshBasicMaterial({ transparent: true, map: texture });
				planeMaterial.side = THREE.DoubleSide; // 双面;
				titleCard.material = planeMaterial;
				titleCard.material.map.needsUpdate = true;
			}
		}
	});
}

// 切换摄像头画面和标题展示
function switchCameraVideo(cardGroup, flag = true) {
	cardGroup.children.forEach((current) => {
		if (current.name === '摄像头名称') {
			current.visible = !flag;
		} else if (current.name === '监控视频') {
			current.visible = flag;
		}
	});
}

/**
 * @desc 绘制文字
 * @param {object} context canvas的上下文
 * @param {string} t 要绘制的文字
 * @param {number} x 开始绘制的横坐标
 * @param {number} y 开始绘制的纵坐标
 * @param {number} w 一行有多宽
 * @param {number} fontSize 文字大小
 * @param {string} fontColor 文字颜色，默认#ffffff
 * @param {string} textAlign 文字对齐方式 默认 left
 */
function drawText(context, t, x, y, w, fontSize = 62, fontColor = '#ffffff', textAlign = 'left') {
	t = String(t);
	const chr = t.split('');
	let temp = '';
	const row = [];

	context.font = `${fontSize}px Arial`;
	context.fillStyle = fontColor;
	context.textBaseline = 'middle';
	context.textAlign = textAlign;

	for (let a = 0; a < chr.length; a++) {
		if (a > 0 && chr[a - 1] === '\n') {
			row.push(temp);
			temp = chr[a];
			continue;
		}

		if (context.measureText(temp).width < w && context.measureText(temp + chr[a]).width <= w) {
			temp += chr[a];
		} else {
			row.push(temp);
			temp = chr[a];
		}
	}
	row.push(temp);

	for (let b = 0; b < row.length; b++) {
		context.fillText(row[b], x, y + (b + 1) * fontSize * 1.2); // 字体20，间隔24。类似行高
	}
}

function render() {
	camera.lookAt(scene.position);
	const delta = clock.getDelta(); // 获取时间差
	control.update(delta); // 更新时间
	cardList.forEach((current) => {
		current.children.forEach((child) => {
			if (child.name) {
				child.rotation.copy(camera.rotation);
			} else {
				child.rotation.y =
					-Math.atan2(camera.position.x - child.position.x, camera.position.z) + Math.PI;
			}
		});
	});
	renderer.render(scene, camera);
}

function animate() {
	render();
	TWEEN.update();
	requestAnimationFrame(animate);
}

export { init, switchShow, updateCameraCanvas, updateEnvironmentCanvas };
