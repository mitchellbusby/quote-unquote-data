/**
 * Geographical data about your town :D
 */

import { region$, RegionModel } from "./fetchTile";

const updateTextNode = (element: HTMLElement, value: any) => {
  element.innerText = value;
};

const numToPercent = (val: number) => `${Math.round(val * 100)}%`;

/**
 * Renders out region geographical data to the DOM
 * @param region
 */
const renderGeography = (region: RegionModel) => {
  const geographyDiv = document.querySelector(".c-suburb-geography");
  updateTextNode(
    geographyDiv.querySelector(".c-suburb-geography__population"),
    region.model.population
  );
  updateTextNode(
    geographyDiv.querySelector(".c-suburb-geography__name"),
    region.model.name
  );
  updateTextNode(
    geographyDiv.querySelector(".c-suburb-geography__religious"),
    numToPercent(region.model.religious)
  );
  updateTextNode(
    geographyDiv.querySelector(".c-suburb-geography__rent"),
    `$${region.model.median_rent.toFixed(0)}`
  );
  updateTextNode(
    geographyDiv.querySelector(".c-suburb-geography__rent-rate"),
    numToPercent(region.model.rental_rate)
  );
  updateTextNode(
    geographyDiv.querySelector(".c-suburb-geography__unemployment"),
    numToPercent(region.model.unemployment)
  );
};

const initialise = () => {
  region$.subscribe(region => {
    renderGeography(region);
  });
};

export { initialise };
