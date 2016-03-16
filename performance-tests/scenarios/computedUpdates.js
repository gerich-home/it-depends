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
		};

		function koData() {
			var observable = ko.observable(initialValue);
			var computed = ko.computed(function() {
				return observable();
			});

			var subscriptions = [];
			for(var i = 0; i < subscribersCount; ++i) {
				subscriptions.push(computed.subscribe(_noop()));
			}

			return {
				observable: observable,
				subscriptions: subscriptions,
				disposeSubscription: function(subscription) {
					subscription.dispose();
				}
			};
		};

		function itDependsData() {
			var observable = itDepends.value(initialValue);
			var computed = itDepends.computed(function() {
				return observable();
			});

			var subscriptions = [];
			for(var i = 0; i < subscribersCount; ++i) {
				subscriptions.push(computed.onChange(_noop()));
			}

			return {
				observable: observable,
				subscriptions: subscriptions,
				disposeSubscription: function(subscription) {
					subscription.disable();
				}
			};
		};

		var testContext = {
			ko: koData(),
			itDepends: itDependsData()
		};
	};

	Benchmark.prototype.teardown = function() {
		function disposeSubscriptions(sourceName) {
			var source = testContext[sourceName];
			for(var i = 0; i < source.subscriptions.length; ++i) {
				source.disposeSubscription(source.subscriptions[i]);
			}
		}

		disposeSubscriptions('ko');
		disposeSubscriptions('itDepends');
	};

	var suite = new Benchmark.Suite('computed updated ' + updatesCount + ' times with ' + subscribersCount + ' subscribers');

	suite.add('knockout', function() {
		for (var i = 0; i < updatesCount; i++) {
			testContext.ko.observable(i);
		}
	});

	suite.add('itDepends', function() {
		for (var i = 0; i < updatesCount; i++) {
			testContext.itDepends.observable.write(i);
		}
	});

	return suite;
};
