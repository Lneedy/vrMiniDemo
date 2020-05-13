const {Raycaster, Vector2} = require('threejs-miniprogram');

let raycaster = new Raycaster();
let touchObj = new Vector2()


// 添加 描述
function setLable (touchObj, camera) {
  raycaster(touchObj, camera)
}

// 更新 label 的位置
function updateLabelPosition (intersect) {

}

// 获取与射线相交的对象数组
function getIntersects(event, scene) { 
  event.preventDefault();
  // 通过当前的位置(二维坐标)和当前相机的矩阵计算 射线位置
  raycaster.setFromCamera(touchObj, raycaster)
  // 获取与射线相交的对象数组，其中的元素按照距离排序，越近的越靠前
  let intersectsArr = raycaster.intersectObjects(scene.children)
  return intersectsArr
}

// 添加 点击触发事件
function touchLabel() {

}

module.exports = {
  setLable,
  touchLabel,
  getIntersects,
  updateLabelPosition
}
