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

		function koData() {
			var observable = ko.observable(initialValue);

			return {
				observable: observable,
				subscriptions: [],
				disposeSubscription: function(subscription) {
					subscription.dispose();
				}
			};
		};

		function itDependsData() {
			var observable = itDepends.value(initialValue);

			return {
				observable: observable,
				subscriptions: [],
				disposeSubscription: function(subscription) {
					subscription.disable();
				}
			};
		};

		var testContext = {
			ko: koData(),
			itDepends: itDependsData()
		};

		this.on('complete', function() {
			function disposeSubscriptions(sourceName) {
				var source = testContext[sourceName];
				for(var i = 0; i < source.subscriptions.length; ++i) {
					source.disposeSubscription(source.subscriptions[i]);
				}

				source.subscriptions = [];
			}

			disposeSubscriptions('ko');
			disposeSubscriptions('itDepends');
		});
	};

	var suite = new Benchmark.Suite('subscribe to observable with ' + subscribersCount + ' subscribers');

	suite.add('knockout', function() {
		for (var i = 0; i < subscribersCount; i++) {
			testContext.ko.subscriptions.push(testContext.ko.observable.subscribe(_noop()));
		}
	});

	suite.add('itDepends', function() {
		for (var i = 0; i < subscribersCount; i++) {
			testContext.itDepends.subscriptions.push(testContext.itDepends.observable.onChange(_noop()));
		}
	});

	return suite;
};
