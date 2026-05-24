import * as THREE from "three";

export function createSceneLights(scene: THREE.Scene) {
  const ambient = new THREE.AmbientLight(0x9ecfff, 0.58);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.65);
  keyLight.position.set(-6, 10, -5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 45;
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0x38bdf8, 1.3, 24);
  rimLight.position.set(0, 3.2, 4);
  scene.add(rimLight);

  return { ambient, keyLight, rimLight };
}
