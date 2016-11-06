var allUsers = [];

var margin = {
  top: 20,
  right: 200,
  bottom: 100,
  left: 200
};

var currentRowNum = 0;

var width = window.innerWidth - margin.left - margin.right;
// var height = window.innerHeight - margin.top - margin.bottom;

// height = viz.chart.rowHeight * defaultUsers.length;

viz.chart.init(width, 0, margin);

function updateAxis() {
  viz.chart.setScaleDomain(viz.data.getDomain(viz.data.dateAccessor));
  viz.chart.updateAxisElment();
}

function handleNewCommits(err, user, commits) {
  if (err) {
    console.log(err);
    d3.select('.status').text(err);
    viz.ui.hideSpinner();
    return;
  }
  if (user === null || commits === null) {
    viz.ui.hideSpinner();
    d3.select('.status').text('Empty data');
    return;
  }
  allUsers.push(user);
  updateAxis();
  d3.select('.status').text('');
  d3.select('#githubID-input').node().value = '';
  d3.select('#repo-input').node().value = '';
  viz.chart.displayCommits(user, commits);
  if (!viz.data.existsOutStandingFetches()) {
    viz.ui.hideSpinner();
  }
}

var circleChart = {};
circleChart.addNewUser = function(user) {
  if (user === null) {
    return;
  }
  viz.ui.showSpinner();
  var row = d3.select('.' + user.username);
  if (row.node() === null) {
    viz.chart.initRow(user, currentRowNum);
    currentRowNum++;
  }
  viz.data.getPubEvent(user, handleNewCommits);
};

circleChart.addNewRepo = function(username, repo) {
  viz.ui.showSpinner();
  viz.data.getRepoCommitsDetail(username, repo, handleRepoCommits);
};

function handleRepoCommits(err, user, commits) {
  if (err) {
    console.log(err);
    d3.select('.status').text(err);
    viz.ui.hideSpinner();
    return;
  }
  console.log(user);
  console.log(commits);
  var row = d3.select('.' + user.username);
  if (row.node() === null) {
    viz.chart.initRow(user, currentRowNum);
    currentRowNum++;
  }
  allUsers.push(user);
  updateAxis();
  d3.select('.status').text('');
  d3.select('#githubID-input').node().value = '';
  d3.select('#repo-input').node().value = '';
  viz.chart.displayCommits(user, commits);
  if (!viz.data.existsOutStandingFetches()) {
    viz.ui.hideSpinner();
  }
}

module.exports = circleChart;
