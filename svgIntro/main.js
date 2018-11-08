d3.csv('data/ages.csv').then(data => {
  data.forEach(d => {
    d.age = +d.age;
  });

  var svg = d3.select('#chart-area').append('svg')
    .attr('width' , 400)
    .attr('height' , 400);

  // passing in data array
  var circles = svg.selectAll('circle')
    .data(data);

  circles.enter()
    .append('circle')
      .attr('cx', function() {
        return Math.random() * 400;
      })
      .attr('cy', (datum, index) => index * 75 + 25)
      .attr('r', function(d) {
        return d.age / 2;
      })
      .attr('fill', (d) => {
        if (d.name === 'Joel') {
          return 'blue';
        }

        return 'red';
      });
}).catch((err) => {
  console.log(err);
});


/*
  Exercise

// Appending a canvas
var eSvg = d3.select('#exercise-canvas').append('svg')
    .attr('width', 500)
    .attr('height', 400);

// Creating an ellipse
const eEll = eSvg.append('ellipse')
  .attr('cx', 200)
  .attr('cy', 200)
  .attr('rx', 50)
  .attr('ry', 100)
  .attr('fill', 'red');

// Creating a rectangle
  const eRec = eSvg.append('rect')
    .attr('x', 400)
    .attr('y', 75)
    .attr('width', 100)
    .attr('height', 600)
    .attr('fill', 'yellow');
*/
