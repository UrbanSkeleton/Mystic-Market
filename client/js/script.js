const socket = io();
let assetData;
const marketHistory = [];
let selectedAsset = null;

function rnd(val) { return Math.round(val * 100) / 100; }

// Function to update the market list
function updateMarketList() {
  let total = 0;
  let amount = 0;
  const marketList = document.querySelector("#market-list");
  marketList.innerHTML = "";

  for (let name in assetData) {
    const asset = assetData[name];
    let increaseText = asset.increase >= 1
                           ? "+" + rnd((asset.increase - 1) * 100) + "%"
                           : "" + rnd((asset.increase - 1) * 100) + "%";

    const marketElement = document.createElement("div");
    marketElement.className = "market-elem";
    marketElement.innerHTML = `${name} - ${rnd(asset.value)} (${increaseText})`;
    marketList.appendChild(marketElement);

    amount += 1;
    total += asset.value;
  }
  marketList.innerHTML += "<br>avg: " + rnd(total / amount);
  updateGraph();
}

// Function to update the graph based on the selected asset
function updateGraph() {
  const container = d3.select("#history-graph-container");
  container.selectAll("svg").remove();
  container.selectAll("div.tooltip").remove();
  const width = container.node().clientWidth;
  const height = 300;
  const margin = {top : 20, right : 30, bottom : 40, left : 50};

  const svg = container.append("svg")
                  .attr("width", width)
                  .attr("height", height)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

  if (!marketHistory.length || !selectedAsset)
    return;

  // Extract data for the selected asset
  const data = marketHistory.map((d, i) => ({
                                   index : marketHistory.length - 1 - i,
                                   value : d[selectedAsset]?.value || 0
                                 }));

  const x = d3.scaleLinear()
                .domain([ 0, marketHistory.length - 1 ]) // Present on the right
                .range([ 0, width - margin.left - margin.right ]);

  // Set the y-scale with some padding for the min and max values
  const yMin = d3.min(data, d => d.value);
  const yMax = d3.max(data, d => d.value);

  const padding = 0.05; // 5% padding around the min/max values

  const y = d3.scaleLinear()
                .domain([
                  yMin - (yMax - yMin) * padding, yMax + (yMax - yMin) * padding
                ]) // Add padding
                .nice()
                .range([ height - margin.top - margin.bottom, 0 ]);

  // X-axis
  svg.append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5))
      .append("text")
      .attr("fill", "black")
      .attr("x", width / 2 - margin.left)
      .attr("y", 35)
      .attr("text-anchor", "middle")
      .text("Time");

  // Y-axis
  svg.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("fill", "black")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2 + margin.top)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .text("Value");

  const line = d3.line().x(d => x(d.index)).y(d => y(d.value));

  const tooltip = container.append("div")
                      .attr("class", "tooltip")
                      .style("position", "absolute")
                      .style("background", "white")
                      .style("padding", "5px")
                      .style("border", "1px solid black")
                      .style("display", "none");

  // Draw the line
  const path =
      svg.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 2)
          .attr("d", line)
          .on("mouseover",
              function(event, d) {
                tooltip.style("display", "block")
                    .html(`Asset: ${selectedAsset}<br>Latest Value: ${
                        rnd(d[d.length - 1].value)}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
              })
          .on("mouseout", function() { tooltip.style("display", "none"); });
}

// Event listener for dropdown selection change
document.getElementById("asset-dropdown")
    .addEventListener("change", function() {
      selectedAsset = this.value;
      updateGraph();
    });

socket.on("assetData", function(data) {
  assetData = data;
  marketHistory.unshift(assetData);
  if (marketHistory.length > 500)
    marketHistory.pop();
  updateMarketList();
});
