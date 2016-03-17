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
		};
	};
	
	var suite = new Benchmark.Suite('write observable ' + updatesCount + ' times with ' + subscribersCount + ' subscribers');

	suite.add('knockout', function() {
		var observable = ko.observable(initialValue);

		for(var i = 0; i < subscribersCount; ++i) {
			observable.subscribe(_noop());
		}
		
		for (var i = 0; i < updatesCount; i++) {
			observable(i);
		}
	});

	suite.add('itDepends', function() {
		var observable = itDepends.value(initialValue);

		for(var i = 0; i < subscribersCount; ++i) {
			observable.onChange(_noop());
		}
		
		for (var i = 0; i < updatesCount; i++) {
			observable.write(i);
		}
	});
	
	return suite;
};