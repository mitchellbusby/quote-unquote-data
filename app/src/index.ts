import "./main.scss";

import {
  Scene,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
} from "three";
import { setLighting, setUpRenderer, setupCamera } from "./sceneSetup";

const canvas = document.getElementById(
  "c-isometric-canvas"
) as HTMLCanvasElement;

const context = canvas.getContext("webgl2");

const scene = new Scene();
const canvasBoundingRect = canvas.getBoundingClientRect();
const aspect = canvasBoundingRect.width / canvasBoundingRect.height;

const d = 20;

const {camera} = setupCamera(aspect, d, scene);
const {renderer} = setUpRenderer(canvas, context, canvasBoundingRect);
setLighting(scene);

const cubeRadius = 3;
const geometry = new BoxGeometry(cubeRadius, cubeRadius, cubeRadius);
const material = new MeshStandardMaterial({
  color: 0x2e7d32
});
const cube = new Mesh(geometry, material);
scene.add(cube);

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
