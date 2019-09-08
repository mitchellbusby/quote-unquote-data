import {
  BoxGeometry,
  Color,
  Fog,
  Mesh,
  MeshStandardMaterial,
  Scene,
  TextureLoader,
  MeshBasicMaterial
} from "three";
import { region$, RegionModel } from "./fetchTile";
import "./main.scss";
import { setLighting, setupCamera, setUpRenderer } from "./sceneSetup";
import { Zone, ZoneColors } from "./ZoneTypes";
import waterTextureImg from "./textures/waterTexture.jpg";
const waterTexture = new TextureLoader().load(waterTextureImg)

let active = [];
let subscriptions = [];

const canvas = document.getElementById(
  "c-isometric-canvas"
) as HTMLCanvasElement;
const title = document.getElementById("title");

const context = canvas.getContext("webgl2");

const scene = new Scene();
const canvasBoundingRect = canvas.getBoundingClientRect();
const aspect = canvasBoundingRect.width / canvasBoundingRect.height;

const d = 20;

const { renderer } = setUpRenderer(canvas, context, canvasBoundingRect);
const { camera, controls } = setupCamera(aspect, d, scene, renderer);

setLighting(scene);

scene.background = new Color("#87CEEB");
scene.fog = new Fog(0xffffff, 0, 200);

const BUILDING_COLOR = "#eeeeee";
// todo: density

const TileDiameter = 3;
const TileGap = 0;
const TilePadding = 0.4;
const BuildingHeight = 1 / 30;

const mapDistanceToInternal = (distance: number) => {
  return (TileDiameter + TileGap) * distance;
};

const mapPopulationToDensity = (population: number) =>
  population * BuildingHeight;

function setRegion(region: RegionModel) {
  title.innerText = region.model.name;
  region.tiles.forEach((tile, idx) => {
    const material = new MeshStandardMaterial({
      color: BUILDING_COLOR
    });

    if (tile.population) {
      const height = mapPopulationToDensity(tile.population);
      const geometry = new BoxGeometry(
        TileDiameter - TilePadding * 2,
        height + 0.1,
        TileDiameter - TilePadding * 2
      );
      const cube = new Mesh(geometry, material);
      scene.add(cube);
      active.push(cube);
      cube.translateX(mapDistanceToInternal(tile.coordinates.x));
      cube.translateZ(mapDistanceToInternal(tile.coordinates.y));
      cube.translateY(height / 2);
    }
    // Add the base for the tile
    const baseMeshMaterial = tile.zone === Zone.Water ? new MeshBasicMaterial({
      map: waterTexture,
    }) : new MeshStandardMaterial({
      color: ZoneColors[tile.zone] || ZoneColors[Zone.Unknown],
    })
    const base = new Mesh(
      new BoxGeometry(TileDiameter, 0.1, TileDiameter),
      baseMeshMaterial,
    );
    scene.add(base);
    active.push(base);
    base.translateX(mapDistanceToInternal(tile.coordinates.x));
    base.translateZ(mapDistanceToInternal(tile.coordinates.y));
  });
}

function animate() {
  controls.update();
  renderer.render(scene, camera);
  let token = requestAnimationFrame(animate);
  if (module.hot) {
    module.hot.dispose(() => {
      cancelAnimationFrame(token);
    });
  }
}

const destroy = () => {
  active.forEach(obj => {
    scene.remove(obj);
  });
  active = [];
};

const initialise = () => {
  region$.subscribe(region => {
    destroy();
    setRegion(region);
    animate();
  });
};

export { initialise };
