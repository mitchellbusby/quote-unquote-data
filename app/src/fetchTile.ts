import { Zone } from "./ZoneTypes";

const fetchRegion = async () => {
  const result = await fetch("/api/region");

  const json = (await result.json()) as RegionModel;

  return json;
};

interface TileModel {
  income: number;
  income_level: number;
  name: string;
  population: number;
  sa2: string;
  zone: Zone
}

interface RegionModel {
  model: {
    // todo: this
  };
  tiles: TileModel[];
}

export { fetchRegion };
