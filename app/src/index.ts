import { tap } from "rxjs/operators";
import { fetchNewRegion, region$ } from "./fetchTile";
import "./main.scss";
import {
  destroy as regionViewerDestroy,
  regionViewerInitialise
} from "./regionViewer";
import { initialise as similarityMapInititalise } from "./similarityMap";

region$.pipe(tap(console.log)).subscribe(region => {
  regionViewerDestroy();
  similarityMapInititalise(region);
  regionViewerInitialise(region);
});

document.querySelector("#randomise-btn").addEventListener("click", () => {
  fetchNewRegion();
});
fetchNewRegion();
