viz.data.getContribution(handleNewContribution);

function handleNewContribution(data) {
  data = filterImportant(data.map(type));

  var g = svg.selectAll('.arc')
      .data(pie(data))
    .enter().append('g')
      .attr('class', 'arc');

  g.append('path')
      .attr('d', arc)
      .style('fill', function(d) { return color(d.data.author.id); });

  g.append('text')
      .attr('transform', function(d) { return 'translate(' + labelArc.centroid(d) + ')'; })
      .attr('dy', '.35em')
      .text(formatText);
}

function formatText(d) {
  return d.data.author.login + ': ' + d.data.total;
}

function filterImportant(data) {
  console.log('filtering:');
  console.log(data);
  return data;
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

function type(d) {
  d.total = +d.total;
  return d;
}
