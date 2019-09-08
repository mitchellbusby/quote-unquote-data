import {loadingRegion$, region$} from './fetchTile';
import { regions$, fetchSpecificTiles } from './fetchRegions';

const chooseRandomElement = arr => arr[Math.floor(Math.random() * arr.length)];

const initialise = () => {
    const randomRealSuburbBtn = document.querySelector("#real-suburb-btn");

    regions$.subscribe((allRegions) => {
        randomRealSuburbBtn.addEventListener("click", async () => {
            // shuffle
            const region = chooseRandomElement(Object.values(allRegions));

            // get tiles
            const tiles = await fetchSpecificTiles(region);

            // set the region
            region$.next({ model: region, tiles });
        });
    });

    loadingRegion$.subscribe((loading) => {
        document.querySelector("#randomise-btn")
            .toggleAttribute('disabled', loading);
        randomRealSuburbBtn.toggleAttribute('disabled', loading);
    });
}

export {initialise};

