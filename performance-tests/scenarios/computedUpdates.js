var Benchmark = require('benchmark');
var itDepends = require('../../out/dist/it-depends.js');
var ko = require('knockout');

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
	};
	
	var suite = new Benchmark.Suite('computed updated ' + updatesCount + ' times with ' + subscribersCount + ' subscribers');

	suite.add('knockout', function() {
		var observable = ko.observable(initialValue);
		var computed = ko.pureComputed(function() {
			return observable();
		});

		for(var i = 0; i < subscribersCount; ++i) {
			computed.subscribe(_noop());
		}
		
		for (var j = 0; j < updatesCount; j++) {
			observable(j);
		}
	});

	suite.add('itDepends', function() {
		var observable = itDepends.value(initialValue);
		var computed = itDepends.computed(function() {
			return observable();
		}).withNoArgs();

		for(var i = 0; i < subscribersCount; ++i) {
			computed.onChange(_noop());
		}
		
		for (var j = 0; j < updatesCount; j++) {
			observable.write(j);
		}
	});

	return suite;
};
