var Benchmark = require('benchmark');
var itDepends = require('../../out/dist/it-depends.js');
var ko = require('knockout');

var calculator = function() {
	return 0;
};

function _noop() {
	return function() {};
};

module.exports = function(subscribersCount) {
	
	var testContext;
	
	global.createTestContext = function() {
		function koData() {
			var computed = ko.computed(calculator);
			
			return {
				computed: computed
			};
		};
		
		function itDependsData() {
			var computed = itDepends.computed(calculator);
			
			return {
				computed: computed
			};
		};
		
		testContext = {
			ko: koData(),
			itDepends: itDependsData(),
			
			tearDown: function() {
			}
		};
	};
	
	global.tearDownContext = function() {
		testContext.tearDown();
	};
	
	Benchmark.prototype.setup = function() {
		global.createTestContext();
	};
	
	Benchmark.prototype.teardown = function() {
		global.tearDownContext();
	};
	
	var suite = new Benchmark.Suite('subscribe to computed with ' + subscribersCount + ' subscribers');

	suite.add('knockout', function() {
		for (var i = 0; i < subscribersCount; i++) {
			testContext.ko.computed.subscribe(_noop());
		}
	});

	suite.add('itDepends', function() {
		for (var i = 0; i < subscribersCount; i++) {
			testContext.itDepends.computed.onChange(_noop());
		}
	});
	
	return suite;
};