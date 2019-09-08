import { RegionModelModel } from "./fetchTile";
import * as RxJS from "rxjs";

let regions$ = new RxJS.ReplaySubject<Regions>(1);

type Regions = { [key: string]: RegionModelModel }

const fetchRegions = async () => {
  const result = await fetch("/api/regions");
  const json = (await result.json()) as Regions;
  regions$.next(json);
  return json;
};


/**
 * Responsible for bootstrapping the regions
 */
const initRegions = () => {
    fetchRegions();
}

export { regions$, initRegions };