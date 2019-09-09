import { RegionListService } from "./fetchRegions";
import { fetchNewRegion } from "./fetchTile";
import GeographyViewer from "./geographyViewer";
import Legend from "./legend";
import "./main.scss";
import ProjectionService from "./projections";
import RandomiseButton from "./randomiseButton";
import { RegionMap } from "./regionViewer";
import SimilarityMap from "./similarityMap";

fetchNewRegion();

const services = [
  new ProjectionService(),
  new RandomiseButton(),
  new Legend(),
  new GeographyViewer(),
  new SimilarityMap(),
  new RegionMap(),
  new RegionListService()
];

services.forEach(service => {
  service.init();
});
