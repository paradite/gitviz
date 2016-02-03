var API_BASE_URL = "https://api.github.com"
var API_USER = "/users/";
var API_PUBLIC_EVENTS = "/events/public";


var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse,
    formatDate = d3.time.format("%H:%M:%S %d %b"),
    formatDateForQuery = d3.time.format("%Y-%m-%dT%H:%M:%SZ"),
    formatTime = d3.time.format("%H:%M:%S");

var margin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100
};

var width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight * 0.9 - margin.top - margin.bottom,
    barHeight = 30;

var commits = [];

var currentRowNum = 0, rowHeight = 20;

var svgWrapper = d3.select("#viz")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var container = svgWrapper.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("pointer-events", "all");

function filterPushEvents(event) {
    return event.type === "PushEvent";
}

function getCommitsFromPushes(data) {
    data.forEach(function (d) {
        commits = commits.concat(d["payload"]["commits"]);
    });
    return commits;
}

function getTextForDisplay(d) {
    if(d.date) {
        return formatTime(d.date) + " " + d["author"]["name"] + " " + d["message"];
    } else {
        return d["author"]["name"] + " " + d["message"];
    }
}

function displayCommits(user, data) {
    console.log(chart);
    var row = chart.select("." + user)
        .selectAll("circle")
        .data(data);

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-5, 0])
        .html(function(d) { return getTextForDisplay(d); });
    svgWrapper.call(tip);

    row.enter()
        .append("circle")
        .attr("r", 2.5)
        .attr("cx", xMap)
        .attr("cy", 0)
        .style("fill", "red")
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
}

function initRow(user, rowNum) {
    var row = chart.append("g")
        .attr("transform", "translate(0," + (rowNum)*rowHeight + ")")
        .classed(user, true);

    row.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width)
        .attr("y2", 0)
        .attr("stroke-width", 1)
        .attr("stroke", "black");

    row.append("text")
        .text(user)
        .attr("y", 3)
        .style("dominant-baseline", "text-before-edge");
}

function fetchCommitDetails(user, commits, cb) {
    var commitsRemaining = 0;
    commits.forEach(function(d){
        commitsRemaining++;
        d3.json(d.url, function(err, res){
            if(err){
                console.log(err);
            } else {
                //console.log(res);
                d.date = parseDate(res["commit"]["author"]["date"]);
                commitsRemaining--;
                if(commitsRemaining === 0){
                    updateAxis();
                    commits.sort(sortTime);
                    console.log(commits);
                    cb(user, commits);
                }
            }
        });
        //console.log(d);
    });
}

function updateAxis() {
    xScale.domain(d3.extent(commits, getDateValue));

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(d3.time.day, 1)
        .ticks(d3.time.days, 1)
        .tickFormat(d3.time.format('%d %b'))
        .tickSize(0);

    xAxisElement.call(xAxis);
}

function getPubEvent (user) {
    var url = API_BASE_URL + API_USER + user + API_PUBLIC_EVENTS;
    d3.json(url, function(err, data){
        if(err) {
            console.log(err);
        } else {
            commits = getCommitsFromPushes(data.filter(filterPushEvents));
            initRow(user, currentRowNum);
            fetchCommitDetails(user, commits, displayCommits);
            currentRowNum++;
        }
    });
}

container.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#FFFFFF");

var chart = container.append("g")
    .attr("width", width)
    .attr("height", height)
    .classed("chart", true);

// x-axis
function getDateValue(d) {
    if(d.date) {
        //console.log(d.date);
        return d.date;
    } else {
        return null;
    }
    //console.log(d.date);
}

function xMap(d) {
    return xScale(getDateValue(d));
}

function timeLabelFormat(d) {
    console.log(d);
    return formatDate(d);
}

function sortTime(d1, d2) {
    if(d1.date < d2.date) {
        return -1;
    } else if(d1.date == d2.date) {
        return 0;
    } else {
        return 1;
    }
}

var xScale = d3.time.scale().range([5, width - 5]);

var xAxisElement = container.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

// xAxisElement.append("text")
//     .attr("class", "x-axis-label")
//     .attr("x", width)
//     .attr("y", 35)
//     .style("text-anchor", "end")
//     .text("time");

getPubEvent("paradite");

