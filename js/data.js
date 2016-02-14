"use strict";

// Data manipulation logic
var data = (function() {

  var API_BASE_URL = "https://api.github.com";
  var API_USER = "/users/";
  var API_PUBLIC_EVENTS = "/events/public";
  var API_ORG = "/orgs/";
  var API_EVENTS = "/events";

  var _commits = {};

  var module = {};

  module.getOrgEvent = function(org, cb) {
    var url = API_BASE_URL + API_ORG + org + API_EVENTS;
    d3.json(url)
      .header("Authorization", "Basic cGFyYWRpdGU6YTFhY2MzM2FlZDU2ZGE5OTg4YzY1NGJkMjQxNzdiZTY1NjFkZTllZQ==")
      .get(function(err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(data.filter(filterPushEvents));
          // _updateCommitsFromPushes(user, data.filter(filterPushEvents));
          // _fetchCommitDetails(user, cb);
        }
      });
  };

  module.getPubEvent = function(user, cb) {
    console.log(user);
    var url = API_BASE_URL + API_USER + user.username + API_PUBLIC_EVENTS;
    d3.json(url)
      .header("Authorization", "Basic cGFyYWRpdGU6YTFhY2MzM2FlZDU2ZGE5OTg4YzY1NGJkMjQxNzdiZTY1NjFkZTllZQ==")
      .get(function(err, data) {
        if (err) {
          console.log(err);
        } else {
          _updateCommitsFromPushes(user, data.filter(filterPushEvents));
          _fetchCommitDetails(user, cb);
        }
      });
  };

  var _updateCommitsFromPushes = function(user, data) {
    if (!_commits[user.username]) {
      _commits[user.username] = [];
    }

    data.forEach(function(event) {
      if (event["payload"]["commits"]) {
        event["payload"]["commits"].forEach(function(commit) {
          if (isCommitValid(user, commit)) {
            _commits[user.username].push(commit);
          } else {
            // console.log("commit from others");
            // console.log(commit["author"]["email"]);
          }
        });
      }
      // _commits[user] = _commits[user].concat(event["payload"]["commits"]);
    });
  }

  var isCommitValid = function(user, commit) {
    if (user.email === (commit["author"]["email"])) {
      return true;
    } else {
      return false;
    }
  }

  var _fetchCommitDetails = function(user, cb) {
    if (!_commits[user.username]) {
      console.log("user does not exist");
      return;
    }
    var commitsRemaining = 0;
    _commits[user.username].forEach(function(d) {
      commitsRemaining++;
      d3.json(d.url)
        .header("Authorization", "Basic cGFyYWRpdGU6YTFhY2MzM2FlZDU2ZGE5OTg4YzY1NGJkMjQxNzdiZTY1NjFkZTllZQ==")
        .get(function(err, res) {
          if (err) {
            console.log(err);
          } else {
            //console.log(res);
            commitsRemaining--;
            var commitDate = parseDate(res["commit"]["author"]["date"]);
            if (isCommitTooEarly(commitDate)) {
              console.log("too ealry");
              return;
            }
            d.date = commitDate;
            // if (commitsRemaining === 0) {
            // _commits[user].sort(sortTime);
            cb(user, _commits[user.username]);
            // }
          }
        });
      //console.log(d);
    });
  }



  var _ValidDateEarliest = new Date(2016, 0, 11); // Semester start at Jan 11

  var isCommitTooEarly = function(date) {
    return date < _ValidDateEarliest;
  }

  module.getDomain = function(accessor) {
    var domains = [];
    for (var userkey in _commits) {
      if (_commits.hasOwnProperty(userkey)) {
        var userCommits = _commits[userkey];
        domains = domains.concat(d3.extent(userCommits, accessor));
      }
    }
    return d3.extent(domains);
  }

  return module;

})();
