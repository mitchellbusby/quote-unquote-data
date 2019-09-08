import { take } from "rxjs/operators";
import { fetchSpecificTiles } from "./fetchRegions";
import { region$ } from "./fetchTile";
import Reloadable from "./reloadable";

export default class ProjectionService extends Reloadable {
  init() {
    document.querySelector("#population-add").addEventListener("click", () => {
      this.subscribe(region$.pipe(take(1)), region => {
        const newModel = {
          ...region.model,
          population: Math.floor(region.model.population * 1.5),
          areas: region.model.areas.map(area => ({
            ...area,
            population: Math.floor(area.population * 1.5)
          }))
        };
        fetchSpecificTiles(newModel).then(tiles => {
          region$.next({ model: newModel, tiles });
        });
      });
    });
    //
    this.setReloadHook(module);
  }
}
