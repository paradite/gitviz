var compression = require('compression');
var express = require('express');
var app = express();
var request = require('request');
var path = require('path');

var API_BASE_URL = 'https://api.github.com';
var API_USER = '/users/';
var API_PUBLIC_EVENTS = '/events/public';
var API_ORG = '/orgs/';
var API_EVENTS = '/events';
var API_PAGE_2_PARAM = '?page=2';

app.set('port', (process.env.PORT || 3000));

app.use(compression());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(function timeLog(req, res, next) {
  var start = Date.now();
  res.on('finish', function() {
    var duration = Date.now() - start;
    console.log(new Date().toLocaleString() + ' ' + duration + ' ' + req.originalUrl);
  });
  next();
});

app.get('*', function(req, res) {
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
    } else {
      res.sendStatus(404);
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Backend listening on port ' + app.get('port') + '!');
});
