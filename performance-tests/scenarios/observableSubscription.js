var Benchmark = require('benchmark');
var itDepends = require('../../out/dist/it-depends.js');
var ko = require('knockout');

module.exports = function(subscribersCount) {
	Benchmark.prototype.args = {
		subscribersCount: subscribersCount,
		ko: ko,
		itDepends: itDepends
	};

	Benchmark.prototype.setup = function() {
		var subscribersCount = this.args.subscribersCount;
		var ko = this.args.ko;
		var itDepends = this.args.itDepends;

		var initialValue = -1;

		function _noop() {
			return function() {};
		};
	};

	var suite = new Benchmark.Suite('subscribe to observable with ' + subscribersCount + ' subscribers');

	suite.add('knockout', function() {
		var observable = ko.observable(initialValue);
		
		for (var i = 0; i < subscribersCount; i++) {
			observable.subscribe(_noop());
		}
	});

	suite.add('itDepends', function() {
		var observable = itDepends.value(initialValue);
		
		for (var i = 0; i < subscribersCount; i++) {
			observable.onChange(_noop());
		}
	});

	return suite;
};
