var circleChart = require('./controller-circle');
var donutChart = require('./controller-donut');

function addNewRepo(input) {
  var start = d3.select('#startdate').node().value;
  var end = d3.select('#enddate').node().value;
  var startDate = viz.util.parseDatePicker(start);
  var endDate = viz.util.parseDatePicker(end);
  if (startDate && endDate) {
    viz.data.setRangeRestriction(startDate, endDate);
  } else {
    viz.data.removeRangeRestriction();
  }

  circleChart.addNewRepo(input.username, input.repo);
  donutChart.initContributionChart(input.username, input.repo);
}

function getUserRepoFromInput() {
  var newInput = {
    username: d3.select('#githubID-input').node().value,
    repo: d3.select('#repo-input').node().value,
    email: ''
  };
  if (newInput.email === '') {
    newInput.email = null;
  }
  if (newInput.username) {
    return newInput;
  } else {
    return null;
  }
}

var addButton = d3.select('#add-btn');

addButton.on('click', function() {
  addNewRepo(getUserRepoFromInput());
});
