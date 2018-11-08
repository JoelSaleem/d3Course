/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

const margin = { top: 100, bottom: 100, left: 50, right: 10 };
const height = 400 - margin.top - margin.bottom;
const width = 600 - margin.left - margin.right;

let interval; // The setInterval used to cycle through years
let dataSet;
let i; // Index of time of this cycling through the years

// x scale
const x = d3.scaleLog()
	.domain([300, 150000])
	.range([0, width]);

// y scale
const y = d3.scaleLinear()
	.domain([0, 90])
	.range([height, 0]);

const r = d3.scalePow().exponent(2)
	.domain([0, 1000000000])
	.range([5,25]);

const svg = d3.select('#chart-area').append('svg')
	.attr('height', height + margin.top + margin.bottom)
	.attr('width', width + margin.right + margin.left);

const g = svg.append('g')
  .attr('transform', `translate(${margin.left}, 0)`);

const xAxisGroup = g.append('g')
  .attr('class', 'x-axis')
  .attr('transform', `translate(0, ${height})`);

const yAxisGroup = g.append('g')
  .attr('class', 'y-axis');

// x axis label
g.append('text')
  .attr('class', 'x-axis label')
  .attr('x', width / 2)
  .attr('y', height + 50)
  .attr('font-size', '20px')
  .attr('text-anchor', 'middle')
  .text('GDP');

const yearLabel = g.append('text')
	  .attr('class', 'x-axis label')
	  .attr('x', width - 100)
	  .attr('y', height + 50)
	  .attr('font-size', '20px')
	  .attr('text-anchor', 'middle');

// y axis label
g.append('text')
  .attr('class', 'y-axis label')
  .attr('x', height / -2)
  .attr('y', -40)
  .attr('font-size', '20px')
  .attr('text-anchor', 'middle')
  .attr('transform', 'rotate(-90)')
  .text('Life Expectancy /year');

const legend = g.append('g')
	.attr('transform', `translate(${width - 10}, ${height - 125})`);

const continents = [
	{
		continent: 'asia',
		colour: "rgb(173,152,178)"
	},
	{
		continent: 'europe',
		colour: "rgb(183,110,121)"
	},
	{
		continent: 'africa',
		colour: "rgb(157,136,89)"
	},
	{
		continent: 'americas',
		colour: "rgb(91,45,52)"
	}
]

continents.forEach((el, i) => {
	const legendRow = legend.append('g')
		.attr('transform', `translate(0, ${i * 20})`);

	legendRow.append('rect')
		.attr('width', 10)
		.attr('height', 10)
		.attr('fill', el.colour);

	legendRow.append('text')
		.attr('x', -10)
		.attr('y', 10)
		.attr('text-anchor', 'end')
		.text(el.continent[0].toUpperCase().concat(el.continent.slice(1)));
});

// Tooltip text
const tip = d3.tip().attr('class', 'd3-tip')
	.html(d => {
		let text = `<strong>Country: </strong><span style='color:red'>${d.country}</span><br>`;
		text += `<strong>Continent: </strong><span style='color:red;text-transform:capitalize'>${d.continent}</span><br>`;
		text += `<strong>Life Expectancy: </strong><span style='color:red'>${d3.format('.2f')(d.life_exp)}</span><br>`;
		text += `<strong>GDP per capita: </strong><span style='color:red'>${d3.format('$,.0f')(d.income)}</span><br>`;
		text += `<strong>Population: </strong><span style='color:red'>${d3.format(',.0f')(d.population)}</span><br>`;
		return text;
	});

// Call tooltip. i.e. provide context
g.call(tip);

d3.json("data/data.json").then(data => {
	// Pass in a single year
	i = 0;

	dataSet = data; // Global dataSet

	// initialise
	update(dataSet[0].countries, dataSet[0].year);
});

// jQuery to control play button
$("#play-button")
	.on("click", ({ currentTarget }) => {
		// NOTE: if you don't destructure the target, 'this' refers to window
		// however, when using function() {} syntax, this refers to button (no need
		// to destructure)
		let button = $(currentTarget);
		if (button.text() == "Play") {
			button.text("Pause");
			interval = setInterval(step, 100);
		} else if (button.text() == "Pause") {
			button.text("Play");
			clearInterval(interval);
		}
	});

// jQuery to control reset button
$("#reset-button")
	.on("click", ({currentTarget}) => {
		i = 0;
		update(dataSet[0].countries, dataSet[0].year);
	});

$("#continent-select")
	.on("change", () => {
		update(dataSet[i].countries, dataSet[i].year);
	});

$("#date-slider").slider({
	max: 2014,
	min: 1800,
	step: 1,
	slide: (event, ui) => {
		i = ui.value - 1800;
		update(dataSet[i].countries, dataSet[i].year);
	}
})

// Increase the time step-wise
const step = () => {
	update(dataSet[i].countries, dataSet[i].year);
	i++;
	if (i >= dataSet.length) { i = 0; };
};

// Update function
const update = (data, year) => {
	const cleanData = data.filter(i => i.income & i.life_exp);

	// jQuery to filter data according to selection
	const continent = $("#continent-select").val();
	const filteredData = cleanData.filter(el => {
		if (continent === 'all') {
			return true;
		}
		return (el.continent === continent.toLowerCase());
	});

	// x axis generator
	const xAxisCall = d3.axisBottom(x)
		.tickValues([400, 4000, 4000]);
	xAxisGroup.call(xAxisCall)
		.selectAll('text')
		.attr('y', '20');

  // y axis generator
	const yAxisCall = d3.axisLeft(y)
		.tickFormat(d => d);
	yAxisGroup.call(yAxisCall)
		.selectAll('text')
		.attr('x', -8)
		.attr('y', 1);

	// Join
	const circles = g.selectAll('circle').data(filteredData, el => el.country);

	// exit
	circles.exit().remove();

	// Enter and update (merge)
	circles.enter()
		.append('circle')
		.attr('r', el => r(el.population))
		.attr('cx', el => x(el.income))
		.attr('cy', el => y(el.life_exp))
		.attr('fill', el => {
			// Legend colours
			switch (el.continent) {
				case continents[0].continent:
					return  continents[0].colour;
					break;
			case continents[1].continent:
				return  continents[1].colour;
				break;
				case continents[2].continent:
					return  continents[2].colour;
					break;
				case continents[3].continent:
					return  continents[3].colour;
					break;
				default:
					return 'black';
			}
		})
		.on('mouseover', tip.show) // On mouseover, show tooltip text
		.on('mouseout', tip.hide)  // Hide tooltip text on hover off
		.merge(circles)
			.attr('r', el => r(el.population))
			.attr('cx', el => x(el.income))
			.attr('cy', el => y(el.life_exp));

	yearLabel.text(year);
	$("#year")[0].innerHTML = i + 1800;

	$("#date-slider").slider("value", i + 1800);
};
