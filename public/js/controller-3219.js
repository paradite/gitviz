d3.tip = require('./vendor/d3-tip');

// Constants
COMMITS_CULL_THRESHOLD = 110;

viz.data.getContribution(handleNewContribution);

function handleNewContribution(data) {
  data = filterImportant(data.map(type));

  // Label in the center
  svg.select('.donut-label')
    .attr('dy', '.35em')
    .style('font-size', '32')
    .style('font-weight', 'bolder')
    .style('text-anchor', 'middle')
    .text("Commits");
      
  // Slices of the pie/donut
  svg.select('.slices').selectAll('path.slice')
      .data(pie(data))
    .enter()
    .insert('path')
    .style('fill', function(d) { return color(d.data.author.id); })
    .attr('class', 'slice')
    .attr('d', arc);

  // Label text
  function midAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }

  svg.select('.labels').selectAll('text')
      .data(pie(data))
    .enter().append('text')
      .attr('dy', '.35em')
      .attr('transform', function(d) { 
          // Decide to render on the left or right side
          var pos = outerArc.centroid(d);
          pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
          return 'translate(' + pos + ')';
      })
      .style('text-anchor', function(d) {
          return midAngle(d) < Math.PI ? "start" : "end";
      })
      .style('font-size', function(d) {
        console.log(Math.log(d.data.total));
        return Math.log(d.data.total) * 3 + 'px';
      })
      .text(formatText);

  // Polyline from the slice to text
  svg.select('.lines').selectAll('polyline')
      .data(pie(data))
    .enter()
      .append('polyline')
      .attr('points', function(d) {
        var pos = outerArc.centroid(d);
        pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
        return [arc.centroid(d), outerArc.centroid(d), pos];
    });
}

function formatText(d) {
    console.log(d);
    // Compute the angle
    angle = d.endAngle - d.startAngle;

    // Only display inline if the arc is large enough
    return d.data.author.login + ': ' + d.data.total;
}

function filterImportant(data) {
  //console.log('filtering:');
  //console.log(data);

  // Filtering contributor with less than 2 total to Other
  filteredData = [];
  otherTotal = 0;
  data.forEach(function(d) {
    if (d.total > COMMITS_CULL_THRESHOLD) {
        filteredData.push(d);
    } else {
        otherTotal += d.total;
    }
  });

  // Assign Other contributors
  filteredData.push({
      author: {
          id: 220893,
          login: "Other"
      },
      total: otherTotal
  });

  return filteredData;
}

var width = 960;
var height = 500;
var radius = Math.min(width, height) / 2;

var color = d3.scale.category20();

var arc = d3.svg.arc()
    .outerRadius(radius * 0.7)
    .innerRadius(radius * 0.3);

var outerArc = d3.svg.arc()
    .outerRadius(radius * 0.9)
    .innerRadius(radius * 0.9)

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.total; });

var svg = d3.select('#container').append('svg')
    .attr('width', width)
    .attr('height', height)
  .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

svg.append('g')
    .attr('class', 'slices');
svg.append('g')
    .attr('class', 'labels');
svg.append('g')
    .attr('class', 'lines');

svg.append('g')
  .append('text')
    .attr('class', 'donut-label');

function type(d) {
  d.total = +d.total;
  return d;
}
