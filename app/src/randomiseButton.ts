import {loadingRegion$, region$} from './fetchTile';
import { regions$, fetchSpecificTiles } from './fetchRegions';
import { teardownSubscription } from './teardownSubscription';

const chooseRandomElement = arr => arr[Math.floor(Math.random() * arr.length)];

const initialise = () => {
    const randomRealSuburbBtn = document.querySelector("#real-suburb-btn");

    const regionsSubscription = regions$.subscribe((allRegions) => {
        randomRealSuburbBtn.addEventListener("click", async () => {
            // shuffle
            const region = chooseRandomElement(Object.values(allRegions));

            // get tiles
            const tiles = await fetchSpecificTiles(region);

            // set the region
            region$.next({ model: region, tiles });
        });
    });

    const loadingRegionSubscription = loadingRegion$.subscribe((loading) => {
        document.querySelector("#randomise-btn")
            .toggleAttribute('disabled', loading);
        randomRealSuburbBtn.toggleAttribute('disabled', loading);
    });

    teardownSubscription(regionsSubscription, module);
    teardownSubscription(loadingRegionSubscription, module);
}

export {initialise};

