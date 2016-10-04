
function calendarHeatmap() {
  // defaults
  var width = 750;
  var height = 110;
  var legendWidth = 125;
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // var days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var selector = 'body';
  var SQUARE_LENGTH = 13;
  var SQUARE_PADDING = 1;
  var MONTH_LABEL_PADDING = 6;
  var now = moment().endOf('day').toDate();
  var yearAgo = moment().startOf('day').subtract(1, 'year').toDate();
  var data = [];
  var colorRange = ['#bcd9d8', '#218380'];
  var tooltipEnabled = true;
  var tooltipUnit = 'contribution';
  var legendEnabled = true;
  var onClick = null;
  var onMouseOver = null;
  var onMouseOut = null;
  var dateRange;

  var blankColor = '#fbfcfc';
  var zeroColor = '#fbfcfc';
  var futureColor = '#f1f2f3';

  // setters and getters
  chart.dateRange = function(value) {
    if (!arguments.length) { return dateRange; }
    dateRange = value;
    return chart;
  };

  chart.width = function(value) {
    if (!arguments.length) { return width; }
    width = value;
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) { return height; }
    height = value;
    return chart;
  };

  chart.data = function (value) {
    if (!arguments.length) { return data; }
    data = value;
    return chart;
  };

  chart.selector = function (value) {
    if (!arguments.length) { return selector; }
    selector = value;
    return chart;
  };

  chart.colorRange = function (value) {
    if (!arguments.length) { return colorRange; }
    colorRange = value;
    return chart;
  };

  chart.tooltipEnabled = function (value) {
    if (!arguments.length) { return tooltipEnabled; }
    tooltipEnabled = value;
    return chart;
  };
  
  chart.tooltipUnit = function (value) {
    if (!arguments.length) { return tooltipUnit; }
    tooltipUnit = value;
    return chart;
  };

  chart.legendEnabled = function (value) {
    if (!arguments.length) { return legendEnabled; }
    legendEnabled = value;
    return chart;
  };

  chart.onClick = function (value) {
    if (!arguments.length) { return onClick; }
    onClick = value;
    return chart;
  };

  chart.onMouseOver = function (value) {
    if (!arguments.length) { return onMouseOver; }
    onMouseOver = value;
    return chart;
  };

  chart.onMouseOut = function (value) {
    if (!arguments.length) { return onMouseOut; }
    onMouseOut = value;
    return chart;
  };

  function chart() {
    d3.select(chart.selector()).selectAll('svg.calendar-heatmap').remove(); // remove the existing chart, if it exists
    if(!chart.dateRange()) {
      dateRange = d3.time.days(yearAgo, now); // generates an array of date objects within the specified range  
    }

    // remove data outside the date range
    var start = dateRange[0];
    var end = dateRange[dateRange.length - 1];

    data = data.filter(function(d) {
      return (d.date > start || d.date.getTime() === start.getTime()) && 
      (d.date < end || d.date.getTime() === end.getTime());
    });

    var monthRange = d3.time.months(moment(dateRange[0]).startOf('month').toDate(), dateRange[dateRange.length - 1]); // it ignores the first month if the 1st date is after the start of the month
    var firstDate = moment(dateRange[0]);
    var max = d3.max(chart.data(), function (d) { return d.count; }); // max data value
    // handle exception when data is empty
    if(!max) {
      max = 10;
    }

    // color range
    var color = d3.scale.linear()
      .range(chart.colorRange())
      .domain([0, max]);

    var tooltip;
    var dayRects;

    drawChart();

    function drawChart() {
      var svg = d3.select(chart.selector())
        .append('svg')
        .attr('width', width)
        .attr('class', 'calendar-heatmap')
        .attr('height', height)
        .style('padding', '18px 36px');

      dayRects = svg.selectAll('.day-cell')
        .data(dateRange);  //  array of days for the last yr

      dayRects.enter().append('rect')
        .attr('class', 'day-cell')
        .attr('width', SQUARE_LENGTH)
        .attr('height', SQUARE_LENGTH)
        .attr('fill', blankColor)
        .attr('x', function (d, i) {
          var cellDate = moment(d);
          var result = cellDate.week() - firstDate.week() + (firstDate.weeksInYear() * (cellDate.weekYear() - firstDate.weekYear()));
          return result * (SQUARE_LENGTH + SQUARE_PADDING);
        })
        .attr('y', function (d, i) { return MONTH_LABEL_PADDING + d.getDay() * (SQUARE_LENGTH + SQUARE_PADDING); });

      if (typeof onClick === 'function') {
        dayRects.on('click', function (d) {
          onClick(dataForDate(d));
        });
      }

      if (typeof onMouseOver === 'function' && typeof onMouseOut === 'function') {
        dayRects.on('mouseover', function (d) {
          onMouseOver.call(this, dataForDate(d));
        })
        .on('mouseout', function (d) {
          onMouseOut.call(this, dataForDate(d));
        });
      } else if (chart.tooltipEnabled()) {
        dayRects.on('mouseover', function (d, i) {
          tooltip = d3.select('body')
            .append('div')
            .attr('class', 'day-cell-tooltip')
            .html(tooltipHTMLForDate(d))
            .style('left', function() { return Math.floor(i / 7) * SQUARE_LENGTH + 'px'; })
            .style('top', function() { return d.getDay() * (SQUARE_LENGTH + SQUARE_PADDING) + MONTH_LABEL_PADDING * 3 + 'px'; });
        })
        .on('mouseout', function (d, i) {
          tooltip.remove();
        });
      }

      if (chart.legendEnabled()) {
        var colorRange = [zeroColor, color(0)];
        for (var i = 3; i > 0; i--) {
          colorRange.push(color(max / i));
        }

        var legendGroup = svg.append('g');
        legendGroup.selectAll('.calendar-heatmap-legend')
            .data(colorRange)
            .enter()
          .append('rect')
            .attr('class', 'calendar-heatmap-legend')
            .attr('width', SQUARE_LENGTH)
            .attr('height', SQUARE_LENGTH)
            .attr('x', function (d, i) { return (width - legendWidth) + (i + 1) * (SQUARE_LENGTH + 2); })
            .attr('y', height + SQUARE_PADDING)
            .attr('fill', function (d) { return d; });

        legendGroup.append('text')
          .attr('class', 'calendar-heatmap-legend-text')
          .attr('x', width - legendWidth - 13)
          .attr('y', height + SQUARE_LENGTH)
          .text('Less');

        legendGroup.append('text')
          .attr('class', 'calendar-heatmap-legend-text')
          .attr('x', (width - legendWidth + SQUARE_PADDING) + (colorRange.length + 1) * (SQUARE_LENGTH + 2))
          .attr('y', height + SQUARE_LENGTH)
          .text('More');
      }

      var daysOfChart = chart.data().map(function(day){
        return day.date.toDateString();
      });

      // color future dates with no data using light color and prevent user interactions on them
      dayRects.filter(function(d) {
          return d > now && daysOfChart.indexOf(d.toDateString()) <= -1;
        })
        .attr('fill', futureColor)
        .on('mouseover', null)
        .on('mouseout', null)
        .classed('future', true)
        .style('pointer-events', 'none');
      
      dayRects.filter(function(d) {
        return daysOfChart.indexOf(d.toDateString()) > -1;
        })
        .attr('fill', function(d, i) {
          return chart.data()[i].count ? color(chart.data()[i].count) : zeroColor;
        });

      dayRects.exit().remove();
      var monthLabels = svg.selectAll('.month')
          .data(monthRange)
          .enter().append('text')
          .attr('class', 'month-name')
          .style()
          .text(function (d) {
            return months[d.getMonth()];
          })
          .attr('x', function (d, i) {
            var matchIndex = 0;
            dateRange.find(function (element, index) {
              matchIndex = index;
              return moment(d).isSame(element, 'month') && moment(d).isSame(element, 'year');
            });
            // center month label in month box
            var startPos = (matchIndex / 7) * (SQUARE_LENGTH + SQUARE_PADDING);
            return startPos + (SQUARE_LENGTH + SQUARE_PADDING) * 2.5;
          })
          .attr('y', 0);  // fix these to the top

      days.forEach(function (day, index) {
        svg.append('text')
          .attr('class', 'day-initial')
          .attr('transform', 'translate(-8,' + (SQUARE_LENGTH + SQUARE_PADDING) * (index + 1) + ')')
          .style('text-anchor', 'end')
          .attr('dy', '2')
          .text(day);
      });

      // month border
      var year = dateRange[0].getFullYear();
      svg.append('g')
        .attr('transform', 'translate(-1,' + (MONTH_LABEL_PADDING-1) + ')')
        .selectAll('.monthpath')
        .data(d3.time.months(new Date(year, 0, 1), new Date(year + 1, 0, 1)))
        .enter().append('path')
        .attr('class', 'monthpath')
        .attr('d', monthPath);

    }

    function tooltipHTMLForDate(d) {
      var dateStr = moment(d).format('ddd, MMM Do YYYY');
      var data = dataForDate(d);
      var count = data.count;
      return '<span><strong>' + (count ? count : 'No') + tooltipUnit + (count === 1 ? '' : 's') + '</strong> on ' + dateStr + '</span>';
    }

    function dataForDate(d) {
      var match = chart.data().find(function (element, index) {
        return moment(element.date).isSame(d, 'day');
      });
      if (match) {
        return match;
      }
      return {
        date: d,
        count: 0
      };
    }

    // https://bl.ocks.org/mbostock/4063318 MAGIC
    function monthPath(t0) {
      var cellSize = SQUARE_LENGTH + SQUARE_PADDING;
      var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
          d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
          d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
      return 'M' + (w0 + 1) * cellSize + ',' + d0 * cellSize +
          'H' + w0 * cellSize + 'V' + 7 * cellSize +
          'H' + w1 * cellSize + 'V' + (d1 + 1) * cellSize +
          'H' + (w1 + 1) * cellSize + 'V' + 0 +
          'H' + (w0 + 1) * cellSize + 'Z';
    }
  }

  return chart;
}


// polyfill for Array.find() method
/* jshint ignore:start */
if (!Array.prototype.find) {
  Array.prototype.find = function (predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}
/* jshint ignore:end */
