var API_BASE_URL = "https://api.github.com"

var API_USER = "/users/";
var API_PUBLIC_EVENTS = "/events/public";

var margin = {
    top: 20,
    right: 0,
    bottom: 40,
    left: 70
};

var width = window.innerWidth * 0.8 - margin.left - margin.right,
    height = window.innerHeight * 0.8 - margin.top - margin.bottom,
    barHeight = 30;

var commits = [];

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
    //console.log(JSON.stringify(data, null, 4));
    data.forEach(function (d) {
        commits = commits.concat(d["payload"]["commits"]);
    });
    //commits = commits.map(function(d){
    //    return d["url"];
    //});
    //console.log(commits);
    return commits;
}

function getTextForDisplay(d) {
    if(d.date) {
        return formatTime(d.date) + " " + d["author"]["name"] + " " + d["message"];
    } else {
        return d["author"]["name"] + " " + d["message"];
    }
}

function refreshDisplay(data) {
    var rows = chart.selectAll("text")
        .data(data);

    rows.attr("x", xMap)
        .attr("y", function(d, i) {return barHeight * (i + 1)})
        .text(getTextForDisplay);
}

function displayData(data) {
    var rows = chart.selectAll("text")
        .data(data);

    rows.enter()
        .append("text")
        .attr("x", xMap)
        .style("text-anchor", "start");

    rows.attr("y", function(d, i) {return barHeight * (i + 1)})
        .text(getTextForDisplay);
}

function fetchCommitDetails() {
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
                    console.log(commits);
                    commits.sort(sortTime);
                    console.log(commits);
                    refreshDisplay(commits);
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
        .ticks(5);

    xAxisElement.call(xAxis);
}
function getPubEvent (user) {
    var url = API_BASE_URL + API_USER + user + API_PUBLIC_EVENTS;
    d3.json(url, function(err, data){
        if(err) {
            console.log(err);
        } else {
            commits = getCommitsFromPushes(data.filter(filterPushEvents));
            displayData(commits);
            fetchCommitDetails();
        }
    });
}

container.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#FFFFFF");

var chart = container.append("g")
    .attr("width", width)
    .attr("height", height);

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
    console.log(d1.date + " " + d2.date);
    console.log(d1.date < d2.date);
    if(d1.date < d2.date) {
        return -1;
    } else if(d1.date == d2.date) {
        return 0;
    } else {
        return 1;
    }
}

var xScale = d3.time.scale().range([0, width]);

var xAxisElement = container.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

xAxisElement.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width)
    .attr("y", 35)
    .style("text-anchor", "end")
    .text("time");

//container.append("text")
//	.text('hello')
//	.attr('x', 10)
//	.attr('y', 10)
//	.attr("fill", "red");

getPubEvent("paradite");


var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse,
    formatDate = d3.time.format("%H:%M:%S %d %b"),
    formatDateForQuery = d3.time.format("%Y-%m-%dT%H:%M:%SZ"),
    formatTime = d3.time.format("%H:%M:%S");