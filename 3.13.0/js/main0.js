/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 1 - Star Break Coffee
*/

// BAR CHART

const margin = { top: 100, right: 20, left: 50, bottom: 100};
const width = 500 - margin.right - margin.left;
const height = 500 - margin.top - margin.bottom;

let flag = true;

const t = d3.transition().duration(750);

// Pass in some data!
const svg = d3.select('#chart-area').append('svg')
  .attr('width', width + margin.right + margin.left)
  .attr('height', height + margin.top + margin.bottom);

const g = svg.append('g')
  .attr('transform', `translate(${margin.left}, 0)`);

const xAxisGroup = g.append('g')
  .attr('class', 'x-axis')
  .attr('transform', `translate(0, ${height})`);

const yAxisGroup = g.append('g')
  .attr('class', 'y-axis');

  // x scaling
  const x = d3.scaleBand()
    .range([0, width])
    .paddingInner(0.3)
    .paddingOuter(0.2);

  // y scaling
  const y = d3.scaleLinear()
    .range([height, 0]);

// x axis label
g.append('text')
  .attr('class', 'x-axis label')
  .attr('x', width / 2)
  .attr('y', height + 50)
  .attr('font-size', '20px')
  .attr('text-anchor', 'middle')
  .text('Month');

  // y axis label
let yLabel = g.append('text')
    .attr('class', 'y-axis label')
    .attr('x', height / -2)
    .attr('y', -40)
    .attr('font-size', '20px')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text('Revenue /$');

  d3.json('data/revenues.json').then(data => {

  console.log(data); /* DELETE ME */

  // Re-render every second
  d3.interval(() => {
    const newData = flag ? data : data.slice(1);

    update(newData);
    flag = !flag;
  }, 1000);

  update(data);
});

const update = data => {
  // should we look at revenue or profit?
  const value = flag ? "revenue" : "profit";

  // Clean data (convert strings to numbers)
  data.forEach(el => {
    el.revenue = +el.revenue;
    el.profit = +el.profit;
  })

  // x scaling
  x.domain(data.map(el => el.month));

  // y scaling
  y.domain([0, d3.max(data.map(el => el[value]))]);

  // x axis generator
  const xAxisCall = d3.axisBottom(x);
  xAxisGroup.transition(t).call(xAxisCall)
    .selectAll('text')
    .attr('y','20');

  const yAxisCall = d3.axisLeft(y)
    .tickFormat(d => d);
  yAxisGroup.transition(t).call(yAxisCall)
    .selectAll('text')
    .attr('x', -8)
    .attr('y', 1);

  // Join new data with old elements
  const rectangles = g.selectAll('rect')
    .data(data, d => d.month); // second arg: track data by month rather than
                               // index in array. Useful for exits

  // Exit — remove old elements not present in new data set
  rectangles.exit()
      .attr('fill', 'red')
      .transition(t)
        .attr('y', y(0))
        .attr('height', 0)
        .remove();

  // Update old elements to match new data
  rectangles.transition(t)
    .attr('width', x.bandwidth)
    .attr('height', d => height - y(d[value]))
    .attr('y', d => y(d[value]))
    .attr('x', d => x(d.month));

  // Enter — add new data to the screen
  rectangles.enter().append('rect')
    .attr('width', x.bandwidth)
    .attr('height', 0)
    .attr('y', y(0))
    .attr('x', d => x(d.month))
    .attr('fill', 'grey')
    .merge(rectangles) // Apply to Enter AND Update methods
    .transition(t)
      .attr('width', x.bandwidth)
      .attr('height', d => height - y(d[value]))
      .attr('y', d => y(d[value]))
      .attr('x', d => x(d.month));


  yLabel.text(flag ? 'revenue' : 'profit');
}
