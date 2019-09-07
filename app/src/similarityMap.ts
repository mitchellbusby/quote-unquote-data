import * as d3 from "d3";
import { region$ } from "./fetchTile";

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

const latitude = [-34.1, -33.52];
const longitude = [150.4, 151.36];

const tooltip = d3
  .select("#similar-map")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

const fetchSimilar = async region => {
  const result = await fetch("/api/similar", {
    method: "POST",
    body: JSON.stringify(region.model),
    headers: {
      "Content-Type": "application/json"
    }
  });

  const json = (await result.json()) as Array<{
    region: { lat: number; lon: number; name: string };
    score: number;
  }>;

  return json;
};

export function initialise() {
  let initialised = false;
  region$.subscribe(region => {
    // add the graph canvas to the body of the webpage
    document.querySelector(
      "#similar-label"
    ).textContent = `Similar to ${region["model"]["name"]}`;

    fetchSimilar(region).then(similar => {
      const vis = svg
        .selectAll(".dot")
        .data(similar.map(point => ({ ...point.region, score: point.score })))
        .style("opacity", point => Math.max(1 - point.score * 100000, 0.01))
        .attr(
          "cy",
          point =>
            (height * (point.lat - latitude[0])) / (latitude[1] - latitude[0])
        )
        .attr(
          "cx",
          point =>
            (width * (point.lon - longitude[0])) / (longitude[1] - longitude[0])
        )
        .on("mouseover", function(d) {
          tooltip
            .transition()
            .duration(200)
            .style("opacity", 0.9);
          tooltip
            .text(d.name)
            .style("left", d3.event.pageX + 5 + "px")
            .style("top", d3.event.pageY - 28 + "px");
        });
      console.log("updating");
      if (!initialised) {
        initialised = true;
        console.log("init");
        vis
          .enter()
          .append("circle")
          .attr("class", "dot")
          .attr("r", 3)
          .attr(
            "cy",
            point =>
              (height * (point.lat - latitude[0])) / (latitude[1] - latitude[0])
          )
          .attr(
            "cx",
            point =>
              (width * (point.lon - longitude[0])) /
              (longitude[1] - longitude[0])
          )
          .style("fill", point => "blue")
          .style("opacity", point => Math.max(1 - point.score * 100000, 0.01))
          .on("mouseover", function(d) {
            tooltip
              .transition()
              .duration(200)
              .style("opacity", 0.9);
            tooltip
              .text(d.name)
              .style("left", d3.event.pageX + 5 + "px")
              .style("top", d3.event.pageY - 28 + "px");
          })
          .on("mouseout", function(d) {
            tooltip
              .transition()
              .duration(500)
              .style("opacity", 0);
          });
      }
    });
  });
}
