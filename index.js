var compression = require('compression');
var express = require('express');
var app = express();
var request = require('request');
var path = require('path');

// Authentication
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var User = require(path.join(__dirname, '/models/user'));

// Configure authentication strategies
require('./config/passport')(passport);

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'gitvizvizvizviz', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
}

var API_BASE_URL = 'https://api.github.com';
// var API_USER = '/users/';
// var API_PUBLIC_EVENTS = '/events/public';
// var API_ORG = '/orgs/';
// var API_EVENTS = '/events';
// var API_PAGE_2_PARAM = '?page=2';

var inMemoryCache = [];
var CACHE_MAX = 500;

app.set('port', (process.env.PORT || 3000));

app.use(compression());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/app', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

app.get('/3219', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  res.sendFile(path.join(__dirname, 'public', '3219.html'));
});

// Authentication routes
app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', passport.authenticate('local-login', { failureRedirect: '/login' }), 
  function(req, res) {
    res.redirect('/3219');
  });

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/register', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.post('/register', passport.authenticate('local-signup', { failureRedirect: '/register' }), 
  function(req, res) {
    res.redirect('/3219');
  });

// End of Authentication routes

app.get('/3219-2', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', '3219-2.html'));
});

app.use(function timeLog(req, res, next) {
  var start = Date.now();
  res.on('finish', function() {
    var duration = Date.now() - start;
    console.log(new Date().toLocaleString() + ' ' + duration + ' ' + req.originalUrl);
  });
  next();
});

function addToCache(url, data) {
  console.log('adding url ' + url + ' to cache');
  inMemoryCache.push([url, data, Date.now()]);
  if (inMemoryCache.length > CACHE_MAX) {
    console.log('cache size limit reached');
    inMemoryCache.shift();
  }
}

function isFresh(cache) {
  return (Date.now() - cache[2]) < 3600000; // 1 hour
}

function getCache(url) {
  for (var i = 0; i < inMemoryCache.length; i++) {
    if (inMemoryCache[i][0] === url && isFresh(inMemoryCache[i])) {
      console.log('cache fresh: ' + url);
      return inMemoryCache[i][1];
    } else if (inMemoryCache[i][0] === url) {
      // not fresh
      console.log('cache not fresh: ' + url);
      inMemoryCache.splice(i, 1);
      return null;
    }
  }
  console.log('cache miss: ' + url);
  return null;
}

app.get('*', function(req, res) {
  // check in-memory cache
  var cache = getCache(req.originalUrl);
  if (cache != null) {
    console.log('cache hit: ' + req.originalUrl);
    res.set('Content-Type', 'application/json');
    res.send(cache);
    return;
  }

  console.log('cache not available: ' + req.originalUrl);
  // use server as proxy
  var newurl = API_BASE_URL + req.originalUrl;
  var options = {
    url: newurl,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36',
      'Authorization': process.env.AUTH
    },
    'gzip': true
  };

  request(options, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      // console.log(response);
      res.set('Content-Type', 'application/json');
      res.send(body);
      addToCache(req.originalUrl, body);
    } else {
      console.log('error: ' + error);
      console.log(body);
      res.sendStatus(404);
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Backend listening on port ' + app.get('port') + '!');
});
