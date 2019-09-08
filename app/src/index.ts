import { initRegions } from "./fetchRegions";
import { fetchNewRegion } from "./fetchTile";
import GeographyViewer from "./geographyViewer";
import Legend from "./legend";
import "./main.scss";
import ProjectionService from "./projections";
import RandomiseButton from "./randomiseButton";
import { RegionMap } from "./regionViewer";
import SimilarityMap from "./similarityMap";

document.querySelector("#randomise-btn").addEventListener("click", () => {
  fetchNewRegion();
});
fetchNewRegion();
initRegions();

const services = [
  new ProjectionService(),
  new RandomiseButton(),
  new Legend(),
  new GeographyViewer(),
  new SimilarityMap(),
  new RegionMap()
];

services.forEach(service => {
  service.init();
});
