var ui = (function(){
	var module = {};

	module.hideSpinner = function(){
		d3.select("#spinner")
			.classed("gone", true);
	}

	return module;
}());