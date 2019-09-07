import { fetchNewRegion } from "./fetchTile";
import "./main.scss";
import { initialise as initRegionViewer } from "./regionViewer";
import { initialise as initSimilarityMap } from "./similarityMap";
import { initialise as initGeographyViewer } from "./geographyViewer";

document.querySelector("#randomise-btn").addEventListener("click", () => {
  fetchNewRegion();
});
fetchNewRegion();

initRegionViewer();
initSimilarityMap();
initGeographyViewer();