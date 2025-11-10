(async function() {
  // Chart dimensions and margins
  const width = 900;
  const height = 500;
  const marginTop = 20;
  const marginRight = 30;
  const marginBottom = 40;
  const marginLeft = 50;

  // Load dataset
  let data = await d3.csv("data/DOSE_SyS_Dashboard_Download_10-23-2025 - Overall.csv", d => ({
    year: +d.year,
    month: +d.month,
    age_range: d.age_range,
    drug_rate: +d.drug_rate
  }));

  console.log("Loaded data:", data.slice(0, 5));

  // Convert year + month → date object for x-axis
data.forEach(d => {
  const y = +d.year;
  const m = +d.month;
  if (!isNaN(y) && !isNaN(m)) {
    d.date = new Date(y, m - 1, 1);
  } else {
    d.date = new Date(`${d.year}-${d.month}-01`);
  }
});

// ✅ keep only valid rows
data = data.filter(d =>
  !isNaN(d.drug_rate) &&
  d.date instanceof Date &&
  !isNaN(d.date.getTime())
);

// 🧮 Aggregate by (age_range, month)
// This fixes the “weird jumps” caused by multiple entries per month per age group
const rolled = d3.rollups(
  data,
  v => d3.mean(v, d => d.drug_rate),  // average rate
  d => d.age_range,
  d => d3.timeMonth(d.date)           // round date to start of month
);

// Flatten back into an array of { age_range, date, drug_rate }
const aggregated = rolled.flatMap(([age, values]) =>
  values.map(([date, rate]) => ({
    age_range: age,
    date,
    drug_rate: rate
  }))
);

// Group the aggregated data by age_range
const ageGroups = d3.group(aggregated, d => d.age_range);

  
  // Scales
  const x = d3.scaleUtc()
    .domain(d3.extent(data, d => d.date))
    .range([marginLeft, width - marginRight]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.drug_rate)]).nice()
    .range([height - marginBottom, marginTop]);

const color = d3.scaleOrdinal()
  .domain([...ageGroups.keys()])
  .range([
    "#FDE0D2", // light peach
    "#F2856D", // coral
    "#E85A4F", // tomato
    "#C73539", // deep red
    "#9F1E1E", // dark crimson
    "#FF6B6B", // bright coral
    "#B80D57", // magenta-lean red
    "#F77F00"  // red-orange
  ]);

  // Line generator
  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.drug_rate));

  // SVG setup
  const svg = d3.select("#overdose-line-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  // X-axis
  svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).ticks(d3.timeMonth.every(2)).tickFormat(d3.timeFormat("%b %Y")))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "end");

  // Y-axis
  svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
      .attr("x", -marginLeft)
      .attr("y", 10)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .text("Overdose rate"));


// Draw one animated line per age group
for (const [age, values] of ageGroups) {
  values.sort((a, b) => a.date - b.date);

  const path = svg.append("path")
    .datum(values)
    .attr("fill", "none")
    .attr("stroke", color(age))
    .attr("stroke-width", 2)
    .attr("d", line)
    .attr("opacity", 0.9);

  // Animation: draw line over time
  const totalLength = path.node().getTotalLength();

  path
    .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
    .attr("stroke-dashoffset", totalLength)
    .transition()
      .duration(2000)        // <<< adjust if you want faster/slower
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", 0);
}


  // Add legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - marginRight - 150}, ${marginTop})`);

  const legendItems = [...ageGroups.keys()];

  legend.selectAll("rect")
    .data(legendItems)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * 20)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", d => color(d));

  legend.selectAll("text")
    .data(legendItems)
    .enter()
    .append("text")
    .attr("x", 20)
    .attr("y", (d, i) => i * 20 + 10)
    .text(d => d)
    .style("font-size", "12px")
    .attr("fill", "#ffffffff");


// Animate only when chart is visible on screen
const chartContainer = document.querySelector("#overdose-line-chart");
let hasAnimated = false;

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !hasAnimated) {
      drawLines();
      hasAnimated = true; // run only once
    }
  });
}, { threshold: 0.3 });

observer.observe(chartContainer);


})();
