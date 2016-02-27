// var defaultUsers = [{
//   username: 'paradite',
//   email: 'zhuliangg11@gmail.com'
// }, {
//   username: 'digawp',
//   email: 'digawp@gmail.com'
// }, {
//   username: 'mikelimantara',
//   email: 'mike.bdg@gmail.com'
// }, {
//   username: 'whattokingu',
//   email: 'zhengweihan.91@gmail.com'
// }, {
//   username: 'YijinL',
//   email: 'leowyijin@gmail.com'
// }, {
//   username: 'jinified',
//   email: 'jinified@gmail.com'
// }];

var defaultUsers = [{
  username: 'paradite',
  email: null
}];

// var defaultOrgs = ['nus-fboa2016-si'];

var margin = {
  top: 100,
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
  updateAxis();
  d3.select('.status').text('');
  viz.chart.displayCommits(user, commits);
  // brief delay before hiding spinner
  setTimeout(viz.ui.hideSpinner, 500);
}

// function addNewOrg(org) {
//   myChart.initRow(org, currentRowNum);
//   currentRowNum++;
//   viz.data.getOrgEvent(org, handleNewCommits);
// }

// function addNewOrgs(orgs) {
//   orgs.forEach(function(org) {
//     addNewOrg(org);
//   });
// }

function addNewUser(user) {
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
}

function addNewUsers(users) {
  users.forEach(function(user) {
    addNewUser(user);
  });
}

function getUserFromInput() {
  var newUser = {
    username: d3.select('#githubID-input').node().value,
    email: d3.select('#email-input').node().value
  };
  if (newUser.email === '') {
    newUser.email = null;
  }
  if (newUser.username) {
    return newUser;
  } else {
    return null;
  }
}

addNewUsers(defaultUsers);

var button = d3.select('#add-btn');
// console.log(button);
button.on('click', function() {
  addNewUser(getUserFromInput());
});
// addNewOrgs(defaultOrgs);
// console.log(button);
