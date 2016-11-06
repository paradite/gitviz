var async = require('./vendor/async.min');

// Data manipulation logic
var data = (function() {
  var API_BASE_URL = 'https://api.github.com';
  var API_USER = '/users/';
  var API_PUBLIC_EVENTS = '/events/public';
  var API_ORG = '/orgs/';
  var API_EVENTS = '/events';
  var API_PAGE_2_PARAM = '?page=2';

  var API_REPO = '/repos';

  var API_REPO_CONTRIBUTOR = '/stats/contributors';

  var API_REPO_COMMITS = '/commits';

  var _commits = {};

  var _commitsByDate = {};

  var module = {};

  var _outStandingFeteches = {};

  var _filterPushEvents = function(event) {
    return event.type === 'PushEvent';
  };

  module.getContribution = function(username, repo, cb) {
    var url = API_REPO + '/' + username + '/' + repo + API_REPO_CONTRIBUTOR;
    d3.json(_useBackend(url))
      .get(function(err, data) {
        if (err) {
          console.log(err);
        } else {
          cb(data);
        }
      });
  };

  var _getRepoCommits = function(username, repo, cb) {
    var url = API_REPO + '/' + username + '/' + repo + API_REPO_COMMITS;
    d3.json(_useBackend(url))
      .get(function(err, data) {
        if (err) {
          console.log(err);
        } else {
          cb(data);
        }
      });
  };

  var _clear = function() {
    _commits = {};
    _commitsByDate = {};
    _outStandingFeteches = {};
  };

  module.getRepoCommitsDetail = function(username, repo, cb) {
    _clear();
    _getRepoCommits(username, repo, function(data) {
      data.forEach(function(commitObj) {
        var username = commitObj.author.login;
        // use the url that gives full commit info
        commitObj.commit.url = commitObj.url;
        commitObj.commit.repo = repo;
        if (!_commits.hasOwnProperty(username)) {
          _commits[username] = [];
        }
        _commits[username].push(commitObj.commit);
      });
      console.log(_commits);
      for (username in _commits) {
        _fetchCommitDetails({username: username}, cb);
      }
    });
  };

  module.getCommitDetails = function(commitObj, cb) {
    var url = commitObj.url;
    d3.json(_useBackend(url))
      .get(function(err, data) {
        if (err) {
          console.log(err);
        } else {
          cb(data);
        }
      });
  };

  module.getOrgEvent = function(org, cb) {
    var url = API_BASE_URL + API_ORG + org + API_EVENTS;
    d3.json(_useBackend(url))
      .get(function(err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(data.filter(_filterPushEvents));
          // _updateCommitsFromPushes(user, data.filter(_filterPushEvents));
          // _fetchCommitDetails(user, cb);
        }
      });
  };

  module.getPubEvent = function(user, cb) {
    var url = API_BASE_URL + API_USER + user.username + API_PUBLIC_EVENTS;
    var userDetailUrl = API_BASE_URL + API_USER + user.username;

    async.parallel([
      function(callback) {
        d3.json(_useBackend(url))
          .get(callback);
      },
      function(callback) {
        d3.json(_useBackend(url + API_PAGE_2_PARAM))
          .get(callback);
      },
      function(callback) {
        d3.json(_useBackend(userDetailUrl))
          .get(callback);
      }
    ],
    function(err, results) {
      if (err) {
        console.log(err);
        cb('GitHub API error', null, null);
        return;
      }

      var data1 = results[0];
      var data = data1.concat(results[1]);
      var userdata = results[2];

      if (userdata.email && user.email === null) {
        user.email = userdata.email;
      }
      if (userdata.email === null && user.email === null) {
        cb('There is no GitHub public email for ' + user.username + ', please enter mannually', null, null);
        return;
      }
      if (userdata.name != null) {
        user.name = userdata.name;
      } else {
        user.name = null;
      }
      _updateCommitsFromPushes(user, data.filter(_filterPushEvents));
      _fetchCommitDetails(user, cb);
    });
  };

  var _updateCommitsFromPushes = function(user, data) {
    _commits[user.username] = [];
    data.forEach(function(event) {
      if (event['payload']['commits']) {
        event['payload']['commits'].forEach(function(commit) {
          if (isCommitValid(user, commit)) {
            // add the repo attr
            if (event['repo']['name']) {
              commit['repo'] = event['repo']['name'];
            } else {
              commit['repo'] = null;
            }
            _commits[user.username].push(commit);
          } else {
            // console.log("commit from others");
            // console.log(commit["author"]["email"]);
          }
        });
      }
      // _commits[user] = _commits[user].concat(event["payload"]["commits"]);
    });
  };

  var isCommitValid = function(user, commit) {
    if (user.email === (commit['author']['email'])) {
      return true;
    } else {
      return false;
    }
  };

  var _fetchCommitDetails = function(user, cb) {
    if (_commits[user.username].length === 0) {
      console.log('user does not exist or empty commits');
      cb('User does not exist or have empty commits', null, null);
      return;
    }

    _commitsByDate[user.username] = [];

    _commits[user.username].forEach(function(d) {
      _fetchCommitDetail(user, cb, d);
    });
  };

  var _useBackend = function(url) {
    return url.replace(API_BASE_URL, '');
  };

  var _fetchCommitDetail = function(user, cb, d) {
    if (!_outStandingFeteches[user.username]) {
      _outStandingFeteches[user.username] = 0;
    }
    _outStandingFeteches[user.username]++;

    // use both browser and backend to send request to overcome the 6 connections limit
    // backend is slower than browser in NUS, but faster than browser on heroku
    var finalURL = _useBackend(d.url);
    // if (Date.now() % 6 === 0) {
    //   finalURL = _useBackend(d.url);
    // }
    d3.json(finalURL)
    // d3.json(d.url)
      .get(function(err, res) {
        _handleCommitDetail(user, cb, err, res, d.repo);
      });
  };

  var _handleCommitDetail = function(user, cb, err, res, repo) {
    if (err) {
      console.log(err);
    } else {
      var commitDate = viz.util.parseDate(res['commit']['author']['date']);
      // Expose date at outer level
      res['date'] = commitDate;
      // add repo attr
      res['repo'] = repo;
      var dateOnly = viz.util.formatDateOnly(commitDate);
      if (!isCommitTooEarly(commitDate)) {
        addCommitByDate(user, dateOnly, res);
      }
    }
    _outStandingFeteches[user.username]--;
    if (_outStandingFeteches[user.username] === 0) {
      cb(null, user, getCommitByDate(user));
    }
  };

  var addCommitByDate = function(user, date, commit) {
    // Check if the date is already present
    for (var i = 0; i < _commitsByDate[user.username].length; i++) {
      if (_commitsByDate[user.username][i]['dateStr'] === date) {
        _commitsByDate[user.username][i]['commits'].push(commit);
        return;
      }
    }

    // Date not added yet
    _commitsByDate[user.username].push({
      dateStr: date,
      date: viz.util.formatDateOnly.parse(date),
      commits: [commit],
      name: commit['commit']['author']['name'],
      username: commit['author']['login']
    });
  };

  var getCommitByDate = function(user) {
    return _commitsByDate[user.username];
  };

  // var _sortTime = function(d1, d2) {
  //   if (d1.date < d2.date) {
  //     return -1;
  //   } else if (d1.date === d2.date) {
  //     return 0;
  //   } else {
  //     return 1;
  //   }
  // };

  var _date = new Date();
  var _ValidDateEarliest = _date.setDate(_date.getDate() - 32); // Last month

  var earliestDateRistriction = true;
  var rangeRistriction = false;
  var startDate = null;
  var endDate = null;

  module.setEarliestDateRestriction = function(restrict) {
    earliestDateRistriction = restrict;
  };

  module.setRangeRestriction = function(start, end) {
    startDate = start;
    endDate = end;
    rangeRistriction = true;
  };

  module.removeRangeRestriction = function() {
    rangeRistriction = false;
    earliestDateRistriction = false;
  };

  var isCommitTooEarly = function(date) {
    if (rangeRistriction) {
      return date > endDate || date < startDate;
    } else if (!earliestDateRistriction) {
      return false;
    } else {
      return date < _ValidDateEarliest;
    }
  };

  module.getDomain = function(accessor) {
    var domains = [];
    for (var userkey in _commitsByDate) {
      if (_commitsByDate.hasOwnProperty(userkey)) {
        var userCommits = _commitsByDate[userkey];
        domains = domains.concat(d3.extent(userCommits, accessor));
      }
    }
    var dates = d3.extent(domains);
    // Add paddings to domain
    return [d3.time.day.offset(dates[0], -1), d3.time.day.offset(dates[1], 1)];
  };

  module.MAX_COMMITS = 5;

  module.getPrimaryTooltipData = function(d) {
    return d.username + '(' + d.name + ') ' + viz.util.formatDateNice(d.date);
  };

  module.getAdditionalTooltipData = function(d) {
    return '... and ' + (d.commits.length - module.MAX_COMMITS) + ' more commits';
  };

  module.getSecondaryTooltipDataByIndex = function(d, i) {
    return _getCommitTime(d.commits[i]) + ' ' + _getCommitRepo(d.commits[i]) + ' ' +
      _getStatsContent(d.commits[i]) + ' ' + _getCommitMessage(d.commits[i]);
  };

  function _getCommitRepo(commit) {
    return commit.repo;
  }

  function _getCommitTime(commit) {
    return viz.util.formatTime(commit.date);
  }

  function _getCommitMessage(commit) {
    return commit['commit']['message'];
  }

  function _getStatsContent(commit) {
    return '<span class="addition">+' + commit.stats.additions + '</span> <span class="deletion">-' + commit.stats.deletions + '</span>';
  }

  module.sizeAccessor = function(d) {
    if (d.commits && Array.isArray(d.commits)) {
      return d.commits.length;
    } else {
      return 0;
    }
  };

  module.dateAccessor = function(d) {
    if (d.date) {
      return d.date;
    } else {
      return null;
    }
    // console.log(d.date);
  };

  module.existsOutStandingFetches = function() {
    for (var username in _outStandingFeteches) {
      if (_outStandingFeteches.hasOwnProperty(username) && _outStandingFeteches[username] > 0) {
        return true;
      }
    }
    return false;
  };

  return module;
})();
module.exports = data;
