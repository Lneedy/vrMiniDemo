// const {createScopedThreejs} = require('threejs-miniprogram');

const {
  deviceControl,
  camaraRotationControl
} = require('./DeviceOrientationControl.js');

import * as THREE from '../libs/three.weapp.js';
// import {createScopedThreejs} from '../libs/three.weapp.js'
// import { OrbitControls } from '../jsm/controls/OrbitControls'
const deviceMotionInterval = 'ui';
let camera, scene, renderer;
let canvas;
let touchX,
  touchY,
  device = {};
let oldStatus = true;
let lon, lat, gradient;
let seletedModel, requestId;
let isDeviceMotion = false;
let isAndroid = false;
let last_lon,
  last_lat,
  last_device = {};

let controls;
// 是否正在点击
let touching = false;
// 旋转定时器
let whirling = null;

// 缩放开关
let doubleTouch = true;
// 双指距离
let distance = 0;
// 缩放比例
let scale = 1;

let AMOUNT = 6;
// 当前缩放的状态 0 小 1大
let scalestatus = 0;
let fov = 75;
let fov_default = 100;
let rY = 100;
let pZ = 10;
let pY = 0;
// 初始化 3d对象
function initThree(canvasId, callback) {
  wx.createSelectorQuery()
    .select(canvasId)
    .node()
    .exec(res => {
      canvas = new THREE.global.registerCanvas(canvasId, res[0].node);
      if (typeof callback === 'function') {
        callback(THREE);
      }
    });
}

// 初始化场景
function initScene() {
  lon = -90;
  lat = 0;

  // init 透视相机
  camera = new THREE.PerspectiveCamera(
    // 视角
    fov,
    // fov_default,
    canvas.width / canvas.height,
    1,
    // 1,
    500
  );
  // camera.position.set(0, 10, 100);
  camera.position.set(0, 0, 0);
  scene = new THREE.Scene();
  // 添加基础灯光
  scene.add(new THREE.AmbientLight(0xffffff));
  // init 渲染
  renderer = new THREE.WebGLRenderer({
    //是否执行抗锯齿
    antialias: true,
    // canvas是否包含alpha (透明度)
    alpha: true
  });
  // 轨道控制器
  // controls = new OrbitControls(camera, renderer.domElement)
  // 使动画循环使用时阻尼或自转 意思是否有惯性
  //  controls.enableDamping = true;
  //动态阻尼系数 就是鼠标拖拽旋转灵敏度
  //  controls.dampingFactor = 0.25;
  //是否可以缩放
  //  controls.enableZoom = true;
  //是否自动旋转
  //  controls.autoRotate = false;
  //设置相机距离原点的最远距离
  //  controls.minDistance = 50;
  //设置相机距离原点的最远距离
  //  controls.maxDistance = 1000;
  //是否开启右键拖拽
  //  controls.enablePan = true;
  // controls.enableKeys = true;

  // controls.target.set(0, 5, 0);
  // 设置清除画面的颜色
  renderer.setClearColor(0x000000);
  // 设置场景画布大小
  renderer.setSize(canvas.width, canvas.height);
  // 启动监听行为动画
  animate();
}
// 添加model
function addToScene(_model) {
  seletedModel = _model;
  scene.add(_model);
}
// 开启行为监听
function animate() {
  requestId = canvas.requestAnimationFrame(animate);
  // plane.rotation.y = step;
  if (lon !== last_lon || lat !== last_lat) {
    last_lon = lon;
    last_lat = lat;
    camaraRotationControl(camera, lon, lat, THREE);
  }

  if (
    last_device.alpha !== device.alpha ||
    last_device.beta !== device.beta ||
    last_device.gamma !== device.gamma
  ) {
    last_device.alpha = device.alpha;
    last_device.beta = device.beta;
    last_device.gamma = device.gamma;

    if (isDeviceMotion) {
      deviceControl(camera, device, THREE, isAndroid);
    }
  }
  // 自动旋转
  // if (seletedModel && !touching) {npm
  //   seletedModel.rotation.y += Math.max(0.00096, Math.random() * 0.001);
  // }

  if (seletedModel) {
    // pY = pY > 0 ? pY - 1 : 0;
    // camera.position.y = pY;
    //
    // pZ = pZ > 0 ? pZ - 0.1 : pZ;
    // seletedModel.position.z = 0;

    // 旋转
    // rY = rY < THREE.Math.degToRad(90) ? rY + 0.03 : THREE.Math.degToRad(90);
    // seletedModel.rotation.y = rY;
    // seletedModel.rotation.y = THREE.Math.degToRad(90)
    // camera.updateProjectionMatrix();
  }

  // controls.update()
  renderer.render(scene, camera);
}

// 关闭 动画
function stopAnimate() {
  if (canvas && requestId) {
    canvas.cancelAnimationFrame(requestId);
  }
}

// 点触 前
function onTouchstart(event) {
  isDeviceMotion = false;
  touching = true;
  // 双指
  if (event.touches.length > 1 && doubleTouch) {
    // 双指间的距离
    distance = _getDistance(event);
  } else {
    let touch = event.touches[0];
    touchX = touch.x;
    touchY = touch.y;
  }
}
// 获取双指间距离
function _getDistance(event) {
  let x1 = event.touches[1].clientX;
  let y1 = event.touches[1].clientY;
  let x = event.touches[0].clientX;
  let y = event.touches[0].clientY;
  let xMove = x1 - x;
  let yMove = y1 - y;
  // 双指间的距离
  let distance = Math.sqrt(xMove * xMove + yMove * yMove);
  return distance;
}

// 拖动
function onTouchmove(event) {
  // 双指
  if (event.touches.length > 1 && doubleTouch) {
    let _distance = _getDistance(event);
    let diff = _distance - distance;
    if (diff > 0) {
      scalestatus = 1;
    } else {
      scalestatus = 0;
    }
    let newScale = scale + 0.005 * diff;
    // 最大值
    if (newScale >= 1) {
      scale = newScale = 1;
    } else if (newScale <= 0.3) {
      scale = newScale = 0.3;
    }
    distance = _distance;
  } else {
    let touch = event.touches[0];
    let moveX = touch.x - touchX;
    let moveY = touch.y - touchY;
    lon -= moveX;
    lat -= moveY;
    touchX = touch.x;
    touchY = touch.y;
    gradient = Math.abs(moveX / moveY);
  }
}
function onTouchend(event) {
  isDeviceMotion = oldStatus;
  if (whirling) {
    clearTimeout(whirling);
  }
  whirling = setTimeout(() => {
    touching = false;
  }, 800);
}

// 开始陀螺仪监听
function startDeviceMotion(_isAndroid) {
  isDeviceMotion = true;
  isAndroid = _isAndroid;
  wx.onDeviceMotionChange(function(_device) {
    device = _device;
  });
  wx.startDeviceMotionListening({
    interval: deviceMotionInterval,
    success: function() {
      console.log('startDeviceMotionListening', 'success');
    },
    fail: function(error) {
      console.log('startDeviceMotionListening', error);
    }
  });
}

// 关闭监听陀螺仪
function stopDeviceMotion() {
  isDeviceMotion = false;
  wx.offDeviceMotionChange();
  wx.stopDeviceMotionListening({
    success: function() {
      console.log('stopDeviceMotionListening', 'success');
    },
    fail: function(error) {
      console.log('stopDeviceMotionListening', error);
    }
  });
}

module.exports = {
  initThree,
  initScene,
  addToScene,
  onTouchstart,
  onTouchmove,
  onTouchend,
  startDeviceMotion,
  stopDeviceMotion,
  stopAnimate
};
