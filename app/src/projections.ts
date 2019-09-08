import { take } from "rxjs/operators";
import { fetchSpecificTiles } from "./fetchRegions";
import { region$ } from "./fetchTile";

const initialise = () => {
  document.querySelector("#population-add").addEventListener("click", () => {
    region$.pipe(take(1)).subscribe(region => {
      const newModel = {
        ...region.model,
        population: Math.floor(region.model.population * 1.5),
        areas: region.model.areas.map(area => ({...area, population: Math.floor(area.population * 1.5)}));
      };
      fetchSpecificTiles(newModel).then(tiles => {
        region$.next({ model: newModel, tiles });
      });
    });
  });
};

export { initialise };
