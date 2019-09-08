import { fetchSpecificTiles, regions$ } from "./fetchRegions";
import { loadingRegion$, region$ } from "./fetchTile";
import Reloadable from "./reloadable";

export default class RandomiseButton extends Reloadable {
  chooseRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  public init() {
    const randomRealSuburbBtn = document.querySelector("#real-suburb-btn");

    const regionsSubscription = regions$.subscribe(allRegions => {
      randomRealSuburbBtn.addEventListener("click", async () => {
        // shuffle
        const region = this.chooseRandomElement(Object.values(allRegions));

        // get tiles
        const tiles = await fetchSpecificTiles(region);
        //
        // set the region
        region$.next({ model: region, tiles });
      });
    });

    const loadingRegionSubscription = loadingRegion$.subscribe(loading => {
      document
        .querySelector("#randomise-btn")
        .toggleAttribute("disabled", loading);
      randomRealSuburbBtn.toggleAttribute("disabled", loading);
    });

    this.setReloadHook(module);
    //teardownSubscription(regionsSubscription, module);
    //teardownSubscription(loadingRegionSubscription, module);
  }
}
