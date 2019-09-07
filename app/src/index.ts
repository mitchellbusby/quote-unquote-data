import "./main.scss";

import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
  HemisphereLight,
  DirectionalLight
} from "three";

const canvas = document.getElementById(
  "c-isometric-canvas"
) as HTMLCanvasElement;

const context = canvas.getContext("webgl2");

const scene = new Scene();
const canvasBoundingRect = canvas.getBoundingClientRect();
const aspect = canvasBoundingRect.width / canvasBoundingRect.height;

const d = 20;

const camera = new OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);

camera.position.set(20, 20, 20);
camera.lookAt(scene.position);

const renderer = new WebGLRenderer({
  canvas,
  context
});

// Fix for retina
renderer.setPixelRatio(2);

renderer.setSize(canvasBoundingRect.width, canvasBoundingRect.height);

const cubeRadius = 3;
const geometry = new BoxGeometry(cubeRadius, cubeRadius, cubeRadius);
const material = new MeshStandardMaterial({
  color: 0x2e7d32
});

const cube = new Mesh(geometry, material);

scene.add(cube);

var sunlight = 0xfdfbd3;

var light = new HemisphereLight(sunlight, sunlight, 1);
scene.add(light);

var dirLight = new DirectionalLight(sunlight, 0.5);
dirLight.position.multiplyScalar(500);
dirLight.position.setX(150);
scene.add(dirLight);

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
