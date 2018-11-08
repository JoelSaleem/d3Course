/*
*    main.js
*    Mastering Data Visualization with D3.js
*    CoinStats
*/
var margin = { left:80, right:100, top:50, bottom:100 },
    height = 500 - margin.top - margin.bottom,
    width = 800 - margin.left - margin.right;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left +
        ", " + margin.top + ")");

const t = d3.transition().duration(1000);

// Global var to hold selected currency
// This gets passed in so we can view the data
let selectedCurrency = "bitcoin";
let selectedY = 'price_usd';

// Time parser for x-scale
var parseTime = d3.timeParse("%d/%m/%Y"); // convert string to js date obj
var formatTime = d3.timeFormat("%d/%m/%Y"); // convert js date obj to string
// For tooltip
var bisectDate = d3.bisector(d => d.date ).left;

let dateLower = new Date(parseTime("12/5/2013").getTime());
let dateUpper = new Date(parseTime("31/10/2017").getTime());

// Scales
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Axis generators
var xAxisCall = d3.axisBottom()
var yAxisCall = d3.axisLeft()
    .ticks(6)
    // .tickFormat(function; });

// Axis groups
var xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");
var yAxis = g.append("g")
    .attr("class", "y axis")

// Y-Axis label
let yLabel = yAxis.append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("fill", "#5D6971")
    .text(selectedY);

let cleanedData = []; // get everything in correct date and number formats
let outermostObj = {}; // Holds ALL cleaned data

// Line path generator
let line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d[selectedY]));

d3.json("data/coins.json").then(function(data) {
    // Clean Data
    let coinObj = {};
    let coinData;
    for (let coin in data) {
        cleanedData = [];
        coinData = data[coin];
        coinData.forEach(el => {
          coinObj['24h_vol'] = +el['24h_vol'];
          coinObj['date'] = parseTime(el.date);
          coinObj['price_usd'] = +el['price_usd'];
          coinObj['market_cap'] = +el['market_cap'];
          cleanedData.push(coinObj);
          coinObj = {};
        });
        outermostObj[coin] = cleanedData;
    }


    // Set scale domains
    // x.domain(d3.extent(outermostObj[selectedCurrency], d => d.date));
    // y.domain([0, d3.max(outermostObj[selectedCurrency], d => d[selectedY]) * 1.005]);
    //
    // // Generate axes once scales have been set
    // xAxis.call(xAxisCall.scale(x));
    // yAxis.call(yAxisCall.scale(y));

    g.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-with", "3px")
        // .attr("d", line(outermostObj[selectedCurrency]));

    update(outermostObj[selectedCurrency]);

    /******************************** Tooltip Code ********************************/

    var focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", width);

    focus.append("circle")
        .attr("r", 7.5);

    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

    g.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(outermostObj[selectedCurrency], x0, 1),
            d0 = outermostObj[selectedCurrency][i - 1],
            d1 = outermostObj[selectedCurrency][i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + x(d.date) + "," + y(d[selectedY]) + ")");
        focus.select("text").text(d[selectedY]);
        focus.select(".x-hover-line").attr("y2", height - y(d[selectedY]));
        focus.select(".y-hover-line").attr("x2", -x(d.date));
    }

    /******************************** Tooltip Code ********************************/

});

// Update function
const update = data => {
  // Filter by date (slider)
  data = data.filter(el => (el.date >= dateLower) && (el.date <= dateUpper));

  // change scales
  x.domain(d3.extent(data, d => d.date));
  y.domain([0, d3.max(data, d => d[selectedY]) * 1.005]);

  // re-render line
  line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d[selectedY]));

  // Generate axes once scales have been set
  xAxis.call(xAxisCall.scale(x));
  yAxis.call(yAxisCall.scale(y));

  // Add line to chart
  g.select(".line")
    // .transition(t)
    .attr("d", line(data));
};

// Change currency based on user selection
$("#coin-select")
  .on("change", event => {
    selectedCurrency = event.target.value;
    update(outermostObj[selectedCurrency]);
  });

// Change variable (y-axis) selection
$("#var-select")
  .on("change", event => {
    selectedY = event.target.value;
    yLabel.text(selectedY);
    update(outermostObj[selectedCurrency]);
  });

// slider config and slider event
$("#date-slider").slider({
    range: true,
    max: parseTime("31/10/2017").getTime(),
    min: parseTime("12/5/2013").getTime(),
    step: 86400000, // One day
    values: [parseTime("12/5/2013").getTime(), parseTime("31/10/2017").getTime()],
    slide: (event, ui) => {
      dateLower = new Date(ui.values[0]);
      dateUpper = new Date(ui.values[1]);
      $("#dateLabel1").text(formatTime(dateLower));
      $("#dateLabel2").text(formatTime(dateUpper));
      update(outermostObj[selectedCurrency]);
    }
  });
