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
                .domain([ 0, yMax + (yMax - yMin) * padding ]) // Start from 0
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
  const path = svg.append("path")
                   .datum(data)
                   .attr("fill", "none")
                   .attr("stroke", "steelblue")
                   .attr("stroke-width", 2)
                   .attr("d", line)
}