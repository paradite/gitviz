"use strict";

// DOM Manipulation through d3.js
function chart(width, height, margin) {

  if (!(this instanceof chart))
    return new chart(width, height, margin);

  var _chartElement = null;
  var _svgWrapper = null;
  var _xAxisElement = null;
  var _brushAxisElement = null;

  var COMMIT_STYLE = {
    fill: "white",
    color: "green",
    r: 3.5,
    "stroke-width": 2
  }

  var _xScale = d3.time.scale().range([5, width - 5]);
  var _brushxScale = d3.time.scale().range([5, width - 5]);

  var module = {};

  module.margin = margin;
  module.width = width;
  module.height = height;

  var brushHeight = 30;
  var brushMargin = 30;

  var brush = d3.svg.brush();
  var gBrush;

  function brushed() {
    if (!d3.event.sourceEvent) return; // only transition after input
    var extent0 = brush.extent();

    // if empty when rounded, use floor & ceil instead
    // if (extent1[0] >= extent1[1]) {
    //   extent1[0] = d3.time.day.floor(extent0[0]);
    //   extent1[1] = d3.time.day.ceil(extent0[1]);
    // }

    // d3.select(this).transition()
    //   .call(brush.extent(extent0))
    //   .call(brush.event);

    // Update scale
    _xScale.domain(brush.empty() ? _brushxScale.domain() : brush.extent());
    reScaleData();
  }

  function reScaleData() {
    module.updateAxisElment();
    reScaleCommits();
  }

  function reScaleCommits() {
    _chartElement
      .selectAll("circle.commit")
      .attr("cx", function(d) {
        return _xScale(dateAccessor(d));
      });
  }

  function applyStyle(style, tip) {
    this.attr("r", function(d) {
        return style.r * Math.sqrt(data.sizeAccessor(d));
      })
      .attr("fill", style.fill)
      .attr("stroke", style.color)
      .attr("stroke-width", style["stroke-width"])
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
  }

  function getTooltipContent(d) {
    var text = data.getPrimaryTooltipData(d);

    if (d.commits.length <= data.MAX_COMMITS) {
      for (var i = 0; i < d.commits.length; i++) {
        text += formatSecondaryData(data.getSecondaryTooltipDataByIndex(d, i));
      }
    } else {
      for (var i = 0; i < data.MAX_COMMITS; i++) {
        text += formatSecondaryData(data.getSecondaryTooltipDataByIndex(d, i));
      }
      text += formatAdditionalData(data.getAdditionalTooltipData(d));
    }
    return text;
  }

  function formatSecondaryData(data) {
    return "<br><span class=\"secondary\">" + data + "</span>";
  }

  var formatAdditionalData = formatSecondaryData;

  module.init = function() {
    _svgWrapper = d3.select("body")
      .append("svg")
      .attr("id", "viz")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    gBrush = _svgWrapper.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("class", "brush");

    _brushAxisElement = _svgWrapper.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(" + margin.left + "," + (margin.top + brushHeight) + ")");

    var container = _svgWrapper.append("g")
      .attr("transform", "translate(" + margin.left + "," + (margin.top + brushHeight + brushMargin) + ")")
      .style("pointer-events", "all");

    container.append("clipPath")
      .attr("id", "myClip")
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#FFFFFF");

    _chartElement = container.append("g")
      .attr("width", width)
      .attr("height", height)
      .attr("clip-path", "url(#myClip)")
      .classed("chart", true);

    _xAxisElement = container.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")");

    // xAxisElement.append("text")
    //     .attr("class", "x-axis-label")
    //     .attr("x", width)
    //     .attr("y", 35)
    //     .style("text-anchor", "end")
    //     .text("time");
  }

  module.displayCommits = function(user, data) {
    var row = _chartElement.select("." + user.username)
      .selectAll("circle.commit")
      .data(data);

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-5, 0])
      .html(function(d) {
        return getTooltipContent(d);
      });
    _svgWrapper.call(tip);

    row.enter()
      .append("circle")
      .classed("commit", true);

    applyStyle.call(row, COMMIT_STYLE, tip);

    // update position
    row.attr("cx", function(d) {
      return _xScale(dateOnlyAccessor(d));
    });
  }

  module.initRow = function(user, rowNum) {
    var FIRST_ROW_MARGIN = 15;

    var row = _chartElement.append("g")
      .attr("transform", "translate(0," + ((rowNum) * rowHeight + FIRST_ROW_MARGIN) + ")")
      .attr("width", width)
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

  module.updateAxisElment = function() {

    var xAxis = d3.svg.axis()
      .scale(_xScale)
      .orient("bottom")
      .tickFormat(d3.time.format('%d %b'))
      .tickSize(5);

    var brushxAxis = d3.svg.axis()
      .scale(_brushxScale)
      .orient("bottom")
      .ticks(5)
      .tickFormat(d3.time.format('%d %b'))
      .tickSize(5);

    _xAxisElement.call(xAxis);
    _brushAxisElement.call(brushxAxis);
  }

  module.setScaleDomain = function(domain) {
    var midpoint = new Date((domain[0].getTime() + domain[1].getTime()) / 2);

    _xScale.domain(domain);
    _brushxScale.domain(domain);

    brush.x(_brushxScale)
      .extent([midpoint, domain[1]])
      .on("brush", brushed);

    gBrush
      .call(brush)
      .call(brush.event);

    gBrush.selectAll("rect")
      .attr("height", brushHeight);

    _xScale.domain(brush.empty() ? _brushxScale.domain() : brush.extent());
  }

  module.getScale = function() {
    return _xScale;
  }

  return module;
}
