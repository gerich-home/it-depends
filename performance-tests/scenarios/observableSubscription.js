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
		
		var koobservable = ko.observable(initialValue);
		var idobservable = itDepends.value(initialValue);
	};

	var suite = new Benchmark.Suite('subscribe to observable with ' + subscribersCount + ' subscribers and unsubscribe them');

	suite.add('knockout', function() {
		var subscriptions = [];
		
		for (var i = 0; i < subscribersCount; i++) {
			subscriptions.push(koobservable.subscribe(_noop()));
		}
		
		for (var j = 1; j < subscribersCount; j++) {
			subscriptions[j].dispose();
		}
		
		subscriptions[0].dispose();
	});

	suite.add('itDepends', function() {
		var subscriptions = [];
		
		for (var i = 0; i < subscribersCount; i++) {
			subscriptions.push(idobservable.onChange(_noop()));
		}
		
		for (var j = 1; j < subscribersCount; j++) {
			subscriptions[j].disable();
		}
		
		subscriptions[0].disable();
	});

	return suite;
};
