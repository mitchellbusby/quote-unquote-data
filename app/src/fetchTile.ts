import * as Rx from "rxjs";
import { Zone } from "./ZoneTypes";

const region$ = new Rx.ReplaySubject<RegionModel>(1);

const fetchNewRegion = async () => {
  const result = await fetch("/api/region");

  const json = (await result.json()) as RegionModel;

  region$.next(json);
};

interface TileModel {
  income: number;
  income_level: number;
  name: string;
  population: number;
  sa2: string;
  zone: Zone;
  coordinates: {
    x: number;
    y: number;
  };
}

interface RegionModel {
  model: {
    name: string;
    // todo: this
  };
  tiles: TileModel[];
}

export { region$, fetchNewRegion, RegionModel, TileModel };
