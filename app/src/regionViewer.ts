import { BoxGeometry, Mesh, MeshStandardMaterial, Scene } from "three";
import "./main.scss";
<<<<<<< HEAD

import {
  Scene,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
} from "three";
import { setLighting, setUpRenderer, setupCamera } from "./sceneSetup";
import { fetchRegion } from "./fetchTile";
import {Zone} from "./ZoneTypes";
=======
import { setLighting, setupCamera, setUpRenderer } from "./sceneSetup";
>>>>>>> 9f1b7e156feb96cd8ce585ee309c60df98c9ddec

const canvas = document.getElementById(
  "c-isometric-canvas"
) as HTMLCanvasElement;

const context = canvas.getContext("webgl2");

const scene = new Scene();
const canvasBoundingRect = canvas.getBoundingClientRect();
const aspect = canvasBoundingRect.width / canvasBoundingRect.height;

const d = 20;

const { camera } = setupCamera(aspect, d, scene);
const { renderer } = setUpRenderer(canvas, context, canvasBoundingRect);
setLighting(scene);

// todo: get sc4 color codes
const ZoneColors = {
  [Zone.Residential]: "#007f00",
  [Zone.Commercial]: "#6666e6",
  [Zone.Industrial]: "#ff0000",
}
// todo: density

const TileHeight = 1;
const TileDiameter = 3;

function setRegion(region) {
  region.tiles.forEach((tile, idx) => {
    const material = new MeshStandardMaterial({
      color: ZoneColors[Zone.Residential]
    });
    const geometry = new BoxGeometry(TileDiameter, TileHeight, TileDiameter);
    const cube = new Mesh(geometry, material);
    scene.add(cube);

    cube.translateX(idx * 3);
  });
}

function animate() {
  renderer.render(scene, camera);
  let token = requestAnimationFrame(animate);

  if (module.hot) {
    module.hot.dispose(() => {
      cancelAnimationFrame(token);
    });
  }
}

const regionViewerInitialise = region => {
  setRegion(region);
  animate();
};

export { regionViewerInitialise };
