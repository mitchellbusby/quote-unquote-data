import {loadingRegion$} from './fetchTile';

const initialise = () => {
    loadingRegion$.subscribe((loading) => {
        document.querySelector("#randomise-btn")
            .toggleAttribute('disabled', loading);
    });
}

export {initialise};

