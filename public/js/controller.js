var url = require('url');

var allUsers = [];

var siUsers = [{
  username: 'digawp',
  email: 'digawp@gmail.com'
}, {
  username: 'mikelimantara',
  email: 'mike.bdg@gmail.com'
}, {
  username: 'whattokingu',
  email: 'zhengweihan.91@gmail.com'
}, {
  username: 'YijinL',
  email: 'leowyijin@gmail.com'
}];

var authorUsers = [{
  username: 'paradite',
  email: 'zhuliangg11@gmail.com'
}];

// var defaultOrgs = ['nus-fboa2016-si'];

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
  updateLink(allUsers);
  updateAxis();
  d3.select('.status').text('');
  d3.select('#githubID-input').node().value = '';
  d3.select('#email-input').node().value = '';
  viz.chart.displayCommits(user, commits);
  if (!viz.data.existsOutStandingFetches()) {
    viz.ui.hideSpinner();
  }
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

// addNewUsers(defaultUsers);

var addButton = d3.select('#add-btn');
// console.log(button);
addButton.on('click', function() {
  addNewUser(getUserFromInput());
});

var addAuthorButton = d3.select('#author-btn');
addAuthorButton.on('click', function() {
  addNewUsers(authorUsers);
});

var siButton = d3.select('#si-btn');
siButton.on('click', function() {
  addNewUsers(siUsers);
});
// addNewOrgs(defaultOrgs);
// console.log(button);

function updateLink(users) {
  d3.select('#teamlink').attr('value', generateLink(users));
}

function generateLink(users) {
  var baseURL = window.location.href.split('?')[0];
  baseURL = baseURL + '?users=' + users.map(function(u) { return u.username; }).join(',');
  baseURL = baseURL + '&emails=' + users.map(function(u) { return u.email; }).join(',');
  return baseURL;
}

var urlObj = url.parse(window.location.href, true);

console.log(urlObj);

if (urlObj.query && urlObj.query.users) {
  var usernames = urlObj.query.users.split(',');
  var emails = urlObj.query.emails.split(',');
  var queryUsers = [];
  for (var i = 0; i < usernames.length; i++) {
    if (usernames[i] && emails[i]) {
      queryUsers.push({
        username: usernames[i],
        email: emails[i]
      });
    } else if (usernames[i]) {
      queryUsers.push({
        username: usernames[i],
        email: null
      });
    }
  }
  if (queryUsers.length > 0) {
    addNewUsers(queryUsers);
  }
}

updateLink(allUsers);
