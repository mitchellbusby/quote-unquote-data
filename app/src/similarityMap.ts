import * as d3 from "d3";
import { combineLatest, fromEvent, merge, Subject } from "rxjs";
import { distinctUntilChanged, map, startWith } from "rxjs/operators";
import { regions$ } from "./fetchRegions";
import { region$, TileModel } from "./fetchTile";
import Reloadable from "./reloadable";

const resize$ = new Subject<{ width: number; height: number }>();

const dimensions$ = merge(
  resize$,
  fromEvent(window, "resize").pipe(
    startWith(undefined),
    map(() => {
      const parentElement = document.querySelector(".c-suburb-som-map");
      return {
        width: parentElement.clientWidth,
        height: parentElement.clientHeight
      };
    })
  )
).pipe(distinctUntilChanged());

const svg = d3
  .select("#similar-map")
  .append("svg")
  .call(
    d3.zoom().on("zoom", function() {
      svg.attr("transform", d3.event.transform);
    })
  )
  .append("g");

dimensions$.subscribe(({ width, height }) =>
  d3
    .select("#similar-map svg")
    .attr("width", width)
    .attr("height", height)
);

const INITIAL_VIEWPORT = [[-34.1, -33.52], [150.6, 151.36]];

let latitude = INITIAL_VIEWPORT[0];
let longitude = INITIAL_VIEWPORT[1];

const tooltip = d3
  .select("#similar-map")
  .append("div")
  .attr("class", "tooltip shadow-1")
  .style("opacity", 0)
  .style("position", "fixed")
  .style("background", "white")
  .style("border-radius", "2px")
  .style("padding", "0px 2px");

interface WeightedRegion {
  region: string;
  score: number;
}

const fetchSimilar = async region => {
  const result = await fetch("/api/similar", {
    method: "POST",
    body: JSON.stringify(region.model),
    headers: {
      "Content-Type": "application/json"
    }
  });

  const json = (await result.json()) as Array<WeightedRegion>;

  return json;
};

export default class SimilarityMap extends Reloadable {
  init() {
    let initialised = false;
    let enabled = window.innerWidth > 750;

    this.subscribe(
      combineLatest(region$, regions$, dimensions$),
      ([region, regions, { width, height }]) => {
        document.querySelector(
          "#similar-label"
        ).textContent = `Similar to ${region["model"]["name"]}`;

        fetchSimilar(region).then(similar => {
          const getRegion = name => regions[name];
          const getPoly = ([lat, lon]) => d => {
            const region = getRegion(d.region);
            return region.geometry
              .map(
                ([y, x]) =>
                  `${(width * (y - lon[0])) / (lon[1] - lon[0])},${height -
                    (height * (x - lat[0])) / (lat[1] - lat[0])}`
              )
              .join(" ");
          };
          const vis = svg.selectAll(".dot").data(similar);
          if (!initialised) {
            initialised = true;
            d3.select("#similar-map svg").on("click", async d => {
              if (!enabled) {
                document
                  .querySelector(".c-suburb-som")
                  .classList.toggle("expanded");
                resize$.next({ width: 300, height: 300 });
                enabled = !enabled;
              } else if (window.innerWidth < 750) {
                document
                  .querySelector(".c-suburb-som")
                  .classList.toggle("expanded");
                tooltip
                  .transition()
                  .duration(500)
                  .style("opacity", 0);
                resize$.next({ width: 64, height: 64 });
                enabled = !enabled;
              }
            });

            vis
              .enter()
              .append("polygon")
              .attr("class", "dot")
              .attr("points", getPoly([latitude, longitude]))
              .style("fill", point => "black")
              .style("opacity", point => Math.max(1 - point.score, 0.1))
              .on("mouseover", function(d) {
                if (enabled) {
                  tooltip
                    .transition()
                    .duration(200)
                    .style("opacity", 0.9);
                  tooltip
                    .text(getRegion(d.region).name)
                    .style("left", d3.event.pageX + 5 + "px")
                    .style("top", d3.event.pageY - 28 + "px");
                }
              })
              .on("mouseout", function(d) {
                if (enabled) {
                  tooltip
                    .transition()
                    .duration(500)
                    .style("opacity", 0);
                }
              })
              .on("click", async d => {
                if (enabled) {
                  const result = await fetch("/api/tiles", {
                    method: "POST",
                    body: JSON.stringify(getRegion(d.region)),
                    headers: {
                      "Content-Type": "application/json"
                    }
                  });

                  const json = (await result.json()) as TileModel[];
                  region$.next({ model: getRegion(d.region), tiles: json });
                }
              });
          } else {
            vis
              .style("opacity", point => Math.max(1 - point.score, 0.1))
              .attr("points", getPoly([latitude, longitude]))
              .on("mouseover", function(d) {
                if (enabled) {
                  tooltip
                    .transition()
                    .duration(200)
                    .style("opacity", 0.9);
                  tooltip
                    .text(getRegion(d.region).name)
                    .style("left", d3.event.pageX + 5 + "px")
                    .style("top", d3.event.pageY - 28 + "px");
                }
              });
          }
        });
      }
    );
    this.setReloadHook(module);
  }

  destroy() {
    document.querySelector("#similar-map").innerHTML = "";
    super.destroy();
  }
}
