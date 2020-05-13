//index.js
//获取应用实例
const ThreeObj = require('../../utils/three.js');
const canvasId = '#webgl';
const imageUrl = '../../assets/imgs/demo.jpg';
// const imageUrl = '../../assets/imgs/demo1.jpeg'
// const imageUrl = '../../assets/imgs/demo2.jpg'
// const imageUrl = '../../assets/imgs/demo3.jpg'
const source = '../../assets/sources/demo.mp3'
// const source = 'http://up_mp4.t57.cn/2018/1/03m/13/396131232171.m4a'
const backgroundAudioManager = wx.getBackgroundAudioManager()
let isDeviceMotion = false;
var isAndroid = false;
Page({
  data: {
    musicSrc: source
  },
  onLoad() {
    // set cameraStyle of camera by system platform
    const res = wx.getSystemInfoSync();
    //  铺满全屏
    this.setData({
      canvasWidth: res.pixelRatio * res.windowWidth,
      canvasHeight: res.pixelRatio * res.windowHeight
    });

    // 安卓还有  ios 有差异
    if (res.system.indexOf('Android') !== -1) {
      isAndroid = true;
    }
    // 初始化内容
    ThreeObj.initThree(canvasId, THREE => {
      // 初始化场景
      ThreeObj.initScene();
      this.loadObj(THREE);
    });
    ThreeObj.startDeviceMotion(isAndroid);
    isDeviceMotion = true;
   // 播放背景音乐
  this.playMusic()
  },
  onUnload() {
    isDeviceMotion = false;
    ThreeObj.stopAnimate();
    ThreeObj.stopDeviceMotion();
  },
  bindtouchstart_callback(event) {
    ThreeObj.onTouchstart(event);
  },
  bindtouchmove_callback(event) {
    ThreeObj.onTouchmove(event);
  },
  bindtouchend_callback(event) {
    ThreeObj.onTouchend(event);
  },
  // 新建物体
  loadObj(THREE) {
    // 新建一个球体
    let geometry = new THREE.SphereGeometry(64, 64, 64);
    //  缩放几何体
    geometry.scale(1, 1, -1);
    wx.showLoading({
      title: 'Loading...'
    });
    //  加载图片材质
    let texture1 = new THREE.TextureLoader().load(imageUrl);
    wx.hideLoading();
    // 立即使用纹理进行材质创建
    let material1 = new THREE.MeshBasicMaterial({map: texture1});

    // 空间
    let model = new THREE.Mesh(geometry, material1);
    // 正向角度设置
    // model.rotation.set(0, 0, 0);
    model.rotation.set(THREE.Math.degToRad(0), THREE.Math.degToRad(90), THREE.Math.degToRad(-270));
    // model.rotation.set(0, THREE.Math.degToRad(90), 0);
    // model.rotation.set(0, THREE.Math.degToRad(90), THREE.Math.degToRad(90));
    // 将球体添加进当前的场景中
    ThreeObj.addToScene(model);
  },
  //
  toggleDeviceMotion() {
    if (isDeviceMotion) {
      ThreeObj.stopDeviceMotion();
    } else {
      ThreeObj.startDeviceMotion(isAndroid);
    }
    isDeviceMotion = !isDeviceMotion;
  },
  // 播放背景音乐
  playMusic () {
    backgroundAudioManager.title = '此时此刻'
    // 设置了 src 之后会自动播放
    backgroundAudioManager.src = this.data.musicSrc
  },
  pauseMusic () {
    backgroundAudioManager.stop()
  }
});
