import { fromEvent } from "rxjs";
import { debounceTime, startWith } from "rxjs/operators";
import {
  DirectionalLight,
  HemisphereLight,
  OrthographicCamera,
  Scene,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const setUpRenderer = (scene: Scene) => {
  const d = 20;
  const canvas = document.getElementById(
    "c-isometric-canvas"
  ) as HTMLCanvasElement;
  const context = canvas.getContext("webgl2");

  const renderer = new WebGLRenderer({
    canvas,
    context
  });
  // Fix for retina
  renderer.setPixelRatio(2);

  const camera = new OrthographicCamera(
    (-d * window.innerWidth) / window.innerHeight,
    (d * window.innerWidth) / window.innerHeight,
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

  fromEvent(window, "resize")
    .pipe(
      startWith(undefined),
      debounceTime(100)
    )
    .subscribe(() => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.left = (-d * window.innerWidth) / window.innerHeight;
      camera.right = (d * window.innerWidth) / window.innerHeight;
      camera.updateProjectionMatrix();
    });

  return {
    renderer,
    camera,
    controls
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

export { setLighting, setUpRenderer };
