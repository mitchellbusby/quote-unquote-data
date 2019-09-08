import {
  DirectionalLight,
  HemisphereLight,
  OrthographicCamera,
  Scene,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const setUpRenderer = (
  canvas: HTMLCanvasElement,
  context: WebGLRenderingContext,
  canvasBoundingRect: any
) => {
  const renderer = new WebGLRenderer({
    canvas,
    context
  });

  // Fix for retina
  renderer.setPixelRatio(2);

  renderer.setSize(canvasBoundingRect.width, canvasBoundingRect.height);

  return {
    renderer
  };
};

const setLighting = (scene: Scene) => {
  const sunlight = 0xffffff;
  var light = new HemisphereLight(sunlight, sunlight, 1);
  scene.add(light);

  var dirLight = new DirectionalLight(sunlight, 0.5);
  dirLight.position.multiplyScalar(500);
  dirLight.position.setX(150);
  scene.add(dirLight);
};

const setupCamera = (aspect: number, d: number, scene: any, renderer: any) => {
  const camera = new OrthographicCamera(
    -d * aspect,
    d * aspect,
    d,
    -d,
    1,
    1000
  );
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.005;
  controls.screenSpacePanning = false;
  controls.minDistance = 100;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  camera.position.set(50, 50, 50);
  camera.lookAt(scene.position);
  controls.update();

  return {
    camera,
    controls
  };
};

export { setLighting, setUpRenderer, setupCamera };
