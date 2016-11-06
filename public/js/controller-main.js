var circleChart = require('./controller-circle');
var donutChart = require('./controller-donut');

viz.data.setEarliestDateRestriction(false);

function addNewRepo(input) {
  console.log(input.username);
  console.log(input.repo);
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
