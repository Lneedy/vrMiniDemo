const alphaOffset = 0;
// 90:landscape, 0: portrait
const screenOrientation = 0;
let phi = 0, theta = 0;

//物体转晃
function camaraRotationControl(camera, lon, lat, THREE) {
    if (!camera) {
        return;
    }
    // calculate angle
    lat = Math.max(-85, Math.min(85, lat));
    phi = THREE.Math.degToRad(90 - lat);
    theta = THREE.Math.degToRad(lon);
    let target = new THREE.Vector3();
    // 左右方向
    target.x = Math.sin(phi) * Math.cos(theta);
    // 上下方向
    target.y = -Math.cos(phi);
    target.z = Math.sin(phi) * Math.sin(theta);
    // set rotation of model
    camera.lookAt(target);
}

// 角度alpha，beta和gamma形成一组Z-X'-Y''型内在的Tait-Bryan角度
function setObjectQuaternion(THREE) {
    let zee = new THREE.Vector3(0, 0, 1);
    // 欧拉角描述一个旋转变换，通过指定轴顺序和其各个轴向上的指定旋转角度来旋转一个物体。
    let euler = new THREE.Euler();
    let q0 = new THREE.Quaternion();
    let q1 = new THREE.Quaternion(- Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

    return function (quaternion, alpha, beta, gamma, orient) {
        euler.set(beta, alpha, -gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us
        // euler.set(beta, alpha, -gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us
        quaternion.setFromEuler(euler); // orient the device
        // 视角位置
        quaternion.multiply(q1); // camera looks out the back of the device, not the top
        quaternion.multiply(q0.setFromAxisAngle(zee, - orient)); // adjust for screen orientation
    };
};

// 陀螺仪角度
function deviceControl(model, device, THREE, isAndroid) {
    if (!model || !device) {
        return;
    }

    let alpha = device.alpha ? THREE.Math.degToRad(device.alpha) + alphaOffset : 0; // Z
    let beta = device.beta ? THREE.Math.degToRad(device.beta) : 0; // X
    let gamma = device.gamma ? THREE.Math.degToRad(device.gamma) : 0; // Y
    let orient = screenOrientation ? THREE.Math.degToRad(screenOrientation) : 0; // O

    if (isAndroid) {
      beta = -beta;
      alpha = -alpha;
      gamma = -gamma;
    }

    setObjectQuaternion(THREE)(model.quaternion, alpha, beta, gamma, orient);
}

module.exports = { deviceControl, camaraRotationControl};