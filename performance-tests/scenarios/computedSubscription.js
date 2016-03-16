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

		function koData() {
			var computed = ko.computed(calculator);

			return {
				computed: computed,
				subscriptions: [],
				disposeSubscription: function(subscription) {
					subscription.dispose();
				}
			};
		};

		function itDependsData() {
			var computed = itDepends.computed(calculator);

			return {
				computed: computed,
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

		this.on('cycle', function() {
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

	var suite = new Benchmark.Suite('subscribe to computed with ' + subscribersCount + ' subscribers');

	suite.add('knockout', function() {
		if(testContext.ko.subscriptions.length !== 0) {
			console.log(testContext.ko.subscriptions.length);
		}

		for (var i = 0; i < subscribersCount; i++) {
			testContext.ko.subscriptions.push(testContext.ko.computed.subscribe(_noop()));
		}
	});

	suite.add('itDepends', function() {
		if(testContext.itDepends.subscriptions.length !== 0) {
			console.log(testContext.itDepends.subscriptions.length);
		}

		for (var i = 0; i < subscribersCount; i++) {
			testContext.itDepends.subscriptions.push(testContext.itDepends.computed.onChange(_noop()));
		}
	});

	return suite;
};
