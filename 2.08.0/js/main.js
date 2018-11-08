/*
*    main.js
*    Mastering Data Visualization with D3.js
*    2.8 - Activity: Your first visualization!
*/

const margin = { left: 100, right: 10, top: 10, bottom: 100 };

const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg = d3.select('#chart-area').append('svg')
  .attr('height',  height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right);

// svg group
const g = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.right})`);

// x axis label
g.append('text')
  .attr('class', 'x-axis label')
  .attr('x', width / 2)
  .attr('y', height + 100)
  .attr('font-size', '20px')
  .attr('text-anchor', 'middle')
  .text('The world\'s tallest buildings');

  // y axis label
  g.append('text')
    .attr('class', 'y-axis label')
    .attr('x', -(height / 2))
    .attr('y', -60)
    .attr('font-size', '20px')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text('Height /m');

// Read in json data
d3.json('data/buildings.json').then(data => {
  data.forEach(d => {
    d.height = +d.height;
  });

  // set y scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.height)])
    .range([height, 0]);

  // set x scale
  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, width])
    .paddingInner(0.3)
    .paddingOuter(0.3);

  // Set x axis
  const xAxisCall = d3.axisBottom(x);
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxisCall)
    .selectAll('text')
      .attr('y','10')
      .attr('x', '-5')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-40)');

  // Set y axis
  const yAxisCall = d3.axisLeft(y)
    .ticks(3)
    .tickFormat(d => `${d}m`);
  g.append('g')
    .attr('class', 'y-axis')
    .call(yAxisCall);

  // draw rectangles
  const rectangles = g.selectAll('rect')
    .data(data);

  // Loop through data and render a rectangle with a set height
  rectangles.enter()
    .append('rect')
      .attr('width', 50)
      .attr('height', d => {
        return height - y(d.height);
      })
      .attr('x', d => {
        return x(d.name);
      })
      .attr('y', d => {
        return y(d.height);
      })
      .attr('fill', 'grey');
});
