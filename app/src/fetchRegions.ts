import * as RxJS from "rxjs";
import { RegionModelModel, TileModel } from "./fetchTile";
import Reloadable from "./reloadable";

let regions$ = new RxJS.ReplaySubject<Regions>(1);

type Regions = { [key: string]: RegionModelModel };

const fetchRegions = async () => {
  const result = await fetch("/api/regions");
  const json = (await result.json()) as Regions;
  regions$.next(json);
  return json;
};

const fetchSpecificTiles = async region => {
  // todo: use this function in similarityMap.ts
  const result = await fetch("/api/tiles", {
    method: "POST",
    body: JSON.stringify(region),
    headers: {
      "Content-Type": "application/json"
    }
  });

  const json = (await result.json()) as TileModel[];
  return json;
};

class RegionListService extends Reloadable {
  init() {
    fetchRegions();
  }
}

export { regions$, fetchSpecificTiles, RegionListService };
