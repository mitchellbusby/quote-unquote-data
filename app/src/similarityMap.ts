import * as d3 from "d3";
import { region$, RegionModelModel, TileModel } from "./fetchTile";

const margin = { top: 20, right: 20, bottom: 30, left: 40 },
  width = 400 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

const svg = d3
  .select("#similar-map")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const INITIAL_VIEWPORT = [[-34.1, -33.52], [150.6, 151.36]];

let latitude = INITIAL_VIEWPORT[0];
let longitude = INITIAL_VIEWPORT[1];

const tooltip = d3
  .select("#similar-map")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

interface WeightedRegion {
  region: string;
  score: number;
}

let regions;

const fetchRegions = async () => {
  if (regions) {
    return regions;
  }
  const result = await fetch("/api/regions");
  const json = (await result.json()) as { [key: string]: RegionModelModel };
  regions = json;
  return json;
};

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

var zoom = false;

export function initialise() {
  let initialised = false;

  const subscription = region$.subscribe(region => {
    // add the graph canvas to the body of the webpage
    document.querySelector(
      "#similar-label"
    ).textContent = `Similar to ${region["model"]["name"]}`;

    fetchRegions().then(regions =>
      fetchSimilar(region).then(similar => {
        const getRegion = name => regions[name];
        const getPoly = ([lat, lon]) => (d => {
              const region = getRegion(d.region);
              return region.geometry.map(([y, x]) => `${(width * (y - lon[0])) /
                (lon[1] - lon[0])},${height -
                  (height * (x - lat[0])) /
                    (lat[1] - lat[0])}`).join(" ")});
        const vis = svg.selectAll(".dot").data(similar);
        if (!initialised) {
          initialised = true;
          vis
            .enter()
            .append("polygon")
            .attr("class", "dot")
            .attr("points", getPoly([latitude, longitude]))
                .attr("stroke","black")
                .attr("stroke-width",1)
            .style("fill", point => "black")
            .style("opacity", point => Math.max(1 - point.score, 0.1))
            .on("mouseover", function(d) {
              tooltip
                .transition()
                .duration(200)
                .style("opacity", 0.9);
              tooltip
                .text(getRegion(d.region).name)
                .style("left", d3.event.pageX + 5 + "px")
                .style("top", d3.event.pageY - 28 + "px");
            })
            .on("mouseout", function(d) {
              tooltip
                .transition()
                .duration(500)
                .style("opacity", 0);
            })
            .on("click", async d => {
              if (d3.event.shiftKey) {
                if (zoom == false) {
                  const zoom_lat = [
                    getRegion(d.region).lat - 0.1,
                    getRegion(d.region).lat + 0.1
                  ];
                  const zoom_lon = [
                    getRegion(d.region).lon - 0.1,
                    getRegion(d.region).lon + 0.1
                  ];

                  svg
                    .selectAll(".dot")
                    .transition()
                    .attr("points", getPoly([zoom_lat, zoom_lon]))
                    ;
                } else {
                  svg
                    .selectAll(".dot")
                    .transition()
                      .attr("points", getPoly([zoom_lat, zoom_lon]));

                }
                zoom = !zoom;
              } else {
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
              tooltip
                .transition()
                .duration(200)
                .style("opacity", 0.9);
              tooltip
                .text(getRegion(d.region).name)
                .style("left", d3.event.pageX + 5 + "px")
                .style("top", d3.event.pageY - 28 + "px");
            });
        }
      })
    );
  });
  if (module.hot) {
    module.hot.dispose(() => {
      document.querySelector("#similar-map").innerHTML = "";
      subscription.unsubscribe();
    });
  }
}
