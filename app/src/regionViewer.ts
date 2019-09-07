import { BoxGeometry, Mesh, MeshStandardMaterial, Scene } from "three";
import { RegionModel } from "./fetchTile";
import "./main.scss";
import { setLighting, setupCamera, setUpRenderer } from "./sceneSetup";
import { Zone } from "./ZoneTypes";

let active = [];

const canvas = document.getElementById(
  "c-isometric-canvas"
) as HTMLCanvasElement;
const title = document.getElementById("title");

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
  [Zone.Unknown]: "#ffffff"
};
// todo: density

const TileDiameter = 3;
const TileGap = 0.1;

const mapDistanceToInternal = (distance: number) => {
  return TileDiameter * (distance - TileGap);
};

const mapPopulationToDensity = (population: number) => population / 10;

function setRegion(region: RegionModel) {
  title.innerText = region.model.name;
  region.tiles.forEach((tile, idx) => {
    const material = new MeshStandardMaterial({
      color: ZoneColors[tile.zone] || ZoneColors[Zone.Unknown]
    });

    const height = mapPopulationToDensity(tile.population);
    const geometry = new BoxGeometry(TileDiameter, height, TileDiameter);
    const cube = new Mesh(geometry, material);
    scene.add(cube);
    active.push(cube);

    cube.translateX(mapDistanceToInternal(tile.coordinates.x));
    cube.translateZ(mapDistanceToInternal(tile.coordinates.y));
    cube.translateY(height / 2);
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

const destroy = () => {
  active.forEach(obj => {
    scene.remove(obj);
    obj.dispose();
  });
};

export { regionViewerInitialise, destroy };
