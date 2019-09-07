import { fetchRegion } from "./fetchTile";
import "./main.scss";
import { regionViewerInitialise } from "./regionViewer";
import { initialise as similarityMapInititalise } from "./similarityMap";

fetchRegion().then(region => {
  similarityMapInititalise(region);
  regionViewerInitialise(region);
});
