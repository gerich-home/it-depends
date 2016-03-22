var Benchmark = require('benchmark');
var itDepends = require('../../out/dist/it-depends.js');
var ko = require('knockout');

var initialValue = -1;

function _noop() {
	return function() {};
};

module.exports = function(updatesCount, subscribersCount) {
	Benchmark.prototype.args = {
		updatesCount: updatesCount,
		subscribersCount: subscribersCount,
		ko: ko,
		itDepends: itDepends
	};

	Benchmark.prototype.setup = function() {
		var updatesCount = this.args.updatesCount;
		var subscribersCount = this.args.subscribersCount;
		var ko = this.args.ko;
		var itDepends = this.args.itDepends;

		var initialValue = -1;

		function _noop() {
			return function() {};
		}
		
		var koobservable = ko.observable(initialValue);
		var idobservable = itDepends.value(initialValue);

		for(var i = 0; i < subscribersCount; ++i) {
			koobservable.subscribe(_noop());
		}

		for(var i = 0; i < subscribersCount; ++i) {
			idobservable.onChange(_noop());
		}
	};
	
	var suite = new Benchmark.Suite('write observable ' + updatesCount + ' times with ' + subscribersCount + ' subscribers');

	suite.add('knockout', function() {
		for (var j = 0; j < updatesCount; j++) {
			koobservable(j);
		}
	});

	suite.add('itDepends', function() {
		for (var j = 0; j < updatesCount; j++) {
			idobservable.write(j);
		}
	});
	
	return suite;
};