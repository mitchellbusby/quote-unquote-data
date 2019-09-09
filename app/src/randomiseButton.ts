import { combineLatest, fromEvent } from "rxjs";
import { fetchSpecificTiles, regions$ } from "./fetchRegions";
import { fetchNewRegion, loadingRegion$, region$ } from "./fetchTile";
import Reloadable from "./reloadable";

export default class RandomiseButton extends Reloadable {
  private chooseRandomElement<T>(arr: T[]) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  public init() {
    const randomRealSuburbBtn = document.querySelector("#real-suburb-btn");
    const generateBtn = document.querySelector("#randomise-btn");
    this.subscribe(fromEvent(generateBtn, "click"), fetchNewRegion);

    this.subscribe(
      combineLatest(regions$, fromEvent(randomRealSuburbBtn, "click")),
      async ([allRegions, evt]) => {
        // shuffle
        const region = this.chooseRandomElement(Object.values(allRegions));

        // get tiles
        const tiles = await fetchSpecificTiles(region);
        //
        // set the region
        region$.next({ model: region, tiles });
      }
    );

    this.subscribe(loadingRegion$, loading => {
      document
        .querySelector("#randomise-btn")
        .toggleAttribute("disabled", loading);
      randomRealSuburbBtn.toggleAttribute("disabled", loading);
    });

    this.setReloadHook(module);
  }

  destroy() {
    super.destroy();
  }
}
