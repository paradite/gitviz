d3.tip = require('./vendor/d3-tip');

// Constants
var COMMITS_CULL_THRESHOLD = 110;

var donutChart = {};

function handleNewContribution(data) {
  data = filterImportant(data.map(donutChart.type));

  // Label in the center
  donutChart.svg.select('.donut-label')
    .attr('dy', '.35em')
    .style('font-size', '32')
    .style('font-weight', 'bolder')
    .style('text-anchor', 'middle')
    .text('Commits');

  // Slices of the pie/donut
  donutChart.svg.select('.slices').selectAll('path.slice')
    .data(donutChart.pie(data))
    .enter()
    .insert('path')
    .style('fill', function(d) {
      return donutChart.color(d.data.author.id);
    })
    .attr('class', 'slice')
    .attr('d', donutChart.arc);

  // Label text
  function midAngle(d) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }

  donutChart.svg.select('.labels').selectAll('text')
    .data(donutChart.pie(data))
    .enter().append('text')
    .attr('dy', '.35em')
    .attr('transform', function(d) {
      // Decide to render on the left or right side
      var pos = donutChart.outerArc.centroid(d);
      pos[0] = donutChart.radius * (midAngle(d) < Math.PI ? 1 : -1);
      return 'translate(' + pos + ')';
    })
    .style('text-anchor', function(d) {
      return midAngle(d) < Math.PI ? 'start' : 'end';
    })
    .style('font-size', function(d) {
      return (Math.log(d.data.total) + 11) + 'px';
    })
    .text(formatText);

  // Polyline from the slice to text
  donutChart.svg.select('.lines').selectAll('polyline')
    .data(donutChart.pie(data))
    .enter()
    .append('polyline')
    .attr('points', function(d) {
      var pos = donutChart.outerArc.centroid(d);
      pos[0] = donutChart.radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
      return [donutChart.arc.centroid(d), donutChart.outerArc.centroid(d), pos];
    });
}

function formatText(d) {
  // Only display inline if the arc is large enough
  return d.data.author.login + ': ' + d.data.total;
}

function filterImportant(data) {
  if (data.length < 5) {
    return data;
  }
  // console.log('filtering:');
  // console.log(data);
  var max = -1;
  data.forEach(function(d) {
    if (d.total > max) {
      max = d.total;
    }
  });
  // 8% threshold as the top
  var threshold = max * 0.08;
  console.log(threshold);
  var filteredData = [];
  var otherTotal = 0;
  data.forEach(function(d) {
    if (d.total > threshold) {
      filteredData.push(d);
    } else {
      otherTotal += d.total;
    }
  });

  // Assign Other contributors
  filteredData.push({
    author: {
      id: 220893,
      login: 'Others'
    },
    total: otherTotal
  });

  return filteredData;
}

donutChart.initContributionChart = function(userName, repoName) {
  var width = 960;
  var height = 500;
  var radius = Math.min(width, height) / 2;

  donutChart.radius = radius;
  donutChart.color = d3.scale.category20();

  donutChart.arc = d3.svg.arc()
    .outerRadius(radius * 0.7)
    .innerRadius(radius * 0.3);

  donutChart.outerArc = d3.svg.arc()
    .outerRadius(radius * 0.9)
    .innerRadius(radius * 0.9);

  donutChart.pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
      return d.total;
    });

  d3.select('#container2').selectAll('*').remove();
  var svg = d3.select('#container2').append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

  donutChart.svg = svg;

  svg.append('g')
    .attr('class', 'slices');
  svg.append('g')
    .attr('class', 'labels');
  svg.append('g')
    .attr('class', 'lines');

  svg.append('g')
    .append('text')
    .attr('class', 'donut-label');

  viz.data.getContribution(userName, repoName, handleNewContribution);
};

donutChart.type = function(d) {
  d.total = +d.total;
  return d;
};

module.exports = donutChart;
