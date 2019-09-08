import { fetchNewRegion } from "./fetchTile";
import { initialise as initGeographyViewer } from "./geographyViewer";
import { initialise as initLegend } from "./legend";
import "./main.scss";
import { initialise as initRegionViewer } from "./regionViewer";
import { initialise as initSimilarityMap } from "./similarityMap";
import { initialise as initRandomiseButton } from "./randomiseButton";
import { initRegions } from "./fetchRegions";

document.querySelector("#randomise-btn").addEventListener("click", () => {
  fetchNewRegion();
});
fetchNewRegion();
initRegions();

initRegionViewer();
initSimilarityMap();
initGeographyViewer();
initLegend();
initRandomiseButton();