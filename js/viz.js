"use strict";

var parseDate = d3.time.format.utc("%Y-%m-%dT%H:%M:%SZ").parse,
  formatDate = d3.time.format("%d %b %H:%M:%S"),
  formatDateForQuery = d3.time.format("%Y-%m-%dT%H:%M:%SZ"),
  formatDateOnly = d3.time.format("%Y-%m-%d"),
  formatTime = d3.time.format("%H:%M:%S");

var defaultUsers = [{
  username: "paradite",
  email: "zhuliangg11@gmail.com"
}, {
  username: "digawp",
  email: "digawp@gmail.com"
}, {
  username: "mikelimantara",
  email: "mike.bdg@gmail.com"
}, {
  username: "whattokingu",
  email: "zhengweihan.91@gmail.com"
}, {
  username: "YijinL",
  email: "leowyijin@gmail.com"
}];

var defaultOrgs = ["nus-fboa2016-si"];

var margin = {
  top: 100,
  right: 200,
  bottom: 100,
  left: 200
};

var rowHeight = 40;

var currentRowNum = 0;

var width = window.innerWidth - margin.left - margin.right,
  height = window.innerHeight - margin.top - margin.bottom,
  barHeight = 30;

height = rowHeight * defaultUsers.length;

var commits = [];

var myChart = new chart(width, height, margin);

myChart.init();

function updateAxis() {
  myChart.setScaleDomain(data.getDomain(dateOnlyAccessor));
  myChart.updateAxisElment();
}

function handleNewCommits(user, commits) {
  ui.hideSpinner();
  updateAxis();
  myChart.displayCommits(user, commits);
}

function dateAccessor(d) {
  if (d.date) {
    return d.date;
  } else {
    return null;
  }
  //console.log(d.date);
}

function dateOnlyAccessor(d) {
  if (d.date) {
    return d.date;
  } else {
    return null;
  }
  //console.log(d.date);
}

function amountAccessor(d) {
  if (d.commits && Array.isArray(d.commits)) {
    return d.commits.length;
  } else {
    return 0;
  }
  //console.log(d.date);
}

function timeLabelFormat(d) {
  console.log(d);
  return formatDate(d);
}

function addNewOrg(org) {
  myChart.initRow(org, currentRowNum);
  currentRowNum++;
  data.getOrgEvent(org, handleNewCommits);
}

function addNewOrgs(orgs) {
  orgs.forEach(function(org) {
    addNewOrg(org);
  });
}

function addNewUser(user) {
  myChart.initRow(user, currentRowNum);
  currentRowNum++;
  data.getPubEvent(user, handleNewCommits);
}

function addNewUsers(users) {
  users.forEach(function(user) {
    addNewUser(user);
  });
}

addNewUsers(defaultUsers);
// addNewOrgs(defaultOrgs);

// polyfill
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {
        k = 0;
      }
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
        (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}
