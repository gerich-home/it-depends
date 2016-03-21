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

		var calculator = function() {
			return 0;
		};

		function _noop() {
			return function() {};
		};
	};

	var suite = new Benchmark.Suite('subscribe to computed with ' + subscribersCount + ' subscribers');

	suite.add('knockout', function() {
		var computed = ko.pureComputed(calculator);

		for (var i = 0; i < subscribersCount; i++) {
			computed.subscribe(_noop());
		}
	});

	suite.add('itDepends', function() {
		var computed = itDepends.computed(calculator).withNoArgs();

		for (var i = 0; i < subscribersCount; i++) {
			computed.onChange(_noop());
		}
	});

	return suite;
};
