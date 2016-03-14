var util = (function() {
  var module = {};

  module.parseDate = d3.time.format.utc('%Y-%m-%dT%H:%M:%SZ').parse;
  module.formatDate = d3.time.format('%d %b %H:%M:%S');
  module.formatDateForQuery = d3.time.format('%Y-%m-%dT%H:%M:%SZ');
  module.formatDateOnly = d3.time.format('%Y-%m-%d');
  module.formatTime = d3.time.format('%H:%M:%S');
  module.formatDateNice = d3.time.format('%d %b');

  return module;
}());

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
module.exports = util;

