import { BoxGeometry, Mesh, MeshStandardMaterial, Scene } from "three";
import "./main.scss";
import { setLighting, setupCamera, setUpRenderer } from "./sceneSetup";

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

enum Zones {
  Residential = "residential",
  Commercial = "commercial",
  Industrial = "industrial"
}

// todo: get sc4 color codes
const ZoneColors = {
  [Zones.Residential]: "#1ddb00",
  [Zones.Commercial]: "#fcba03",
  [Zones.Industrial]: "#1ddb00"
};

const TileHeight = 1;
const TileDiameter = 3;

function setRegion(region) {
  region.tiles.forEach((tile, idx) => {
    const material = new MeshStandardMaterial({
      color: ZoneColors[Zones.Residential]
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
