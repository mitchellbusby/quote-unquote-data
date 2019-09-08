import { initRegions } from "./fetchRegions";
import { fetchNewRegion } from "./fetchTile";
import GeographyViewer from "./geographyViewer";
import Legend from "./legend";
import "./main.scss";
import ProjectionService from "./projections";
import RandomiseButton from "./randomiseButton";
import { initialise as initRegionViewer } from "./regionViewer";
import SimilarityMap from "./similarityMap";

document.querySelector("#randomise-btn").addEventListener("click", () => {
  fetchNewRegion();
});
fetchNewRegion();
initRegions();

initRegionViewer();

const services = [
  new ProjectionService(),
  new RandomiseButton(),
  new Legend(),
  new GeographyViewer(),
  new SimilarityMap()
];

services.forEach(service => {
  service.init();
});
