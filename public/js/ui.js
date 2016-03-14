var ui = (function() {
  var module = {};

  module.hideSpinner = function() {
    d3.select('#spinner')
      .classed('gone', true);
  };

  module.showSpinner = function() {
    d3.select('#spinner')
      .classed('gone', false);
  };

  return module;
}());

module.exports = ui;
