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

interface RegionModelModel {
  name: string;
  lat: number;
  lon: number;
  population: number;
  religious: number;
  rental_rate: number;
  unemployment: number;
  median_rent: number;
}

interface RegionModel {
  model: RegionModelModel;
  tiles: TileModel[];
}

export { region$, fetchNewRegion, RegionModel, TileModel, RegionModelModel };
