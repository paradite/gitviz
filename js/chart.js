"use strict";

// DOM Manipulation through d3.js
function chart(width, height, margin) {

  if (!(this instanceof chart))
    return new chart(width, height, margin);

  var _chartElement = null;
  var _svgWrapper = null;
  var _xAxisElement = null;

  var COMMIT_STYLE = {
    fill: "white",
    color: "green",
    r: 3.5,
    "stroke-width": 2
  }

  var _xScale = d3.time.scale().range([5, width - 5]);

  var module = {};

  module.margin = margin;
  module.width = width;
  module.height = height;


  function applyStyle(style, tip) {
    this.attr("r", style.r)
      .attr("fill", style.fill)
      .attr("stroke", style.color)
      .attr("stroke-width", style["stroke-width"])
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
  }

  function getTextForDisplay(d) {
    if (d.date) {
      return "<span class=\"secondary\">" + formatDate(d.date) + " " + d["author"]["name"] + "</span> " + d["message"];
    } else {
      return d["author"]["name"] + " " + d["message"];
    }
  }


  module.init = function() {
    var svgWrapper = d3.select("body")
      .append("svg")
      .attr("id", "viz")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var container = svgWrapper.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .style("pointer-events", "all");

    container.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#FFFFFF");

    var chartElement = container.append("g")
      .attr("width", width)
      .attr("height", height)
      .classed("chart", true);

    var xAxisElement = container.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")");

    // xAxisElement.append("text")
    //     .attr("class", "x-axis-label")
    //     .attr("x", width)
    //     .attr("y", 35)
    //     .style("text-anchor", "end")
    //     .text("time");

    _svgWrapper = svgWrapper;
    _chartElement = chartElement;
    _xAxisElement = xAxisElement;
  }

  module.displayCommits = function(user, data) {
    var row = _chartElement.select("." + user.username)
      .selectAll("circle.commit")
      .data(data);

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-5, 0])
      .html(function(d) {
        return getTextForDisplay(d);
      });
    _svgWrapper.call(tip);

    row.enter()
      .append("circle")
      .classed("commit", true);

    applyStyle.call(row, COMMIT_STYLE, tip);

    // update position
    row.attr("cx", function(d) {
      return _xScale(dateAccessor(d));
    });
  }

  module.initRow = function(user, rowNum) {
    var row = _chartElement.append("g")
      .attr("transform", "translate(0," + (rowNum) * rowHeight + ")")
      .classed(user.username, true);

    row.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", width)
      .attr("y2", 0)
      .attr("stroke-width", 1)
      .attr("stroke", "black");

    row.append("text")
      .text(user.username + " " + user.email)
      .attr("y", 3)
      .style("dominant-baseline", "text-before-edge");
  }

  module.updateAxisElment = function(axis) {
    _xAxisElement.call(axis);
  }

  module.setScaleDomain = function(domain) {
    _xScale.domain(domain);
  }

  module.getScale = function() {
    return _xScale;
  }

  return module;
}
