enum Zone {
  Residential = "R",
  Commercial = "C",
  Industrial = "I",
  Unknown = "U",
  Park = "P",
  Water = "W"
}

// todo: get sc4 color codes
const ZoneColors = {
  [Zone.Residential]: "#007f00",
  [Zone.Commercial]: "#6666e6",
  [Zone.Industrial]: "#ff0000",
  [Zone.Water]: "#ddddff",
  [Zone.Park]: "#bdd084",
  [Zone.Unknown]: "#ffffff"
};

const ZoneLabels = {
  [Zone.Residential]: "Residential",
  [Zone.Commercial]: "Commercial",
  [Zone.Industrial]: "Industrial",
  [Zone.Water]: "Water",
  [Zone.Park]: "Park",
  [Zone.Unknown]: "Other"
};

export { Zone, ZoneColors, ZoneLabels };
