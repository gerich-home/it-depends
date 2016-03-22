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
		
		var kocomputed = ko.pureComputed(calculator);
		var idcomputed = itDepends.computed(calculator).withNoArgs();
	};

	var suite = new Benchmark.Suite('subscribe to computed with ' + subscribersCount + ' subscribers and unsubscribe them');

	suite.add('knockout', function() {
		var subscriptions = [];
		
		for (var i = 0; i < subscribersCount; i++) {
			subscriptions.push(kocomputed.subscribe(_noop()));
		}
		
		for (var j = 1; j < subscribersCount; j++) {
			subscriptions[j].dispose();
		}
		
		subscriptions[0].dispose();
	});

	suite.add('itDepends', function() {
		var subscriptions = [];
		
		for (var i = 0; i < subscribersCount; i++) {
			subscriptions.push(idcomputed.onChange(_noop()));
		}
		
		for (var j = 1; j < subscribersCount; j++) {
			subscriptions[j].disable();
		}
		
		subscriptions[0].disable();
	});

	return suite;
};
