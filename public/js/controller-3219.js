d3.tip = require('./vendor/d3-tip');

// Constants
COMMITS_CULL_THRESHOLD = 20;
TOOLTIP_ANGLE_THRESHOLD = 0.2;

viz.data.getContribution(handleNewContribution);

function handleNewContribution(data) {
  data = filterImportant(data.map(type));

  var g = svg.selectAll('.arc')
      .data(pie(data))
    .enter().append('g')
      .attr('class', 'arc')
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide);

  g.append('path')
      .attr('d', arc)
      .style('fill', function(d) { return color(d.data.author.id); });

  g.append('text')
      .attr('transform', function(d) { return 'translate(' + labelArc.centroid(d) + ')'; })
      .attr('dy', '.35em')
      .text(formatText);
}

function formatText(d) {
    console.log(d);
    // Compute the angle
    angle = d.endAngle - d.startAngle;

    // Only display inline if the arc is large enough
    return angle > TOOLTIP_ANGLE_THRESHOLD ? d.data.author.login + ': ' + d.data.total : "";
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
    .outerRadius(radius - 10)
    .innerRadius(0);

var labelArc = d3.svg.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.total; });

var svg = d3.select('#container').append('svg')
    .attr('width', width)
    .attr('height', height)
  .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset(function() {
          return [this.getBBox().height / 2, 0]
      })
      .html(function(d) {
        return d.data.author.login + ": " + d.data.total;
      });
svg.call(tip);

function type(d) {
  d.total = +d.total;
  return d;
}
