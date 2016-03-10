var Benchmark = require('benchmark');
var itDepends = require('../../out/dist/it-depends.js');
var ko = require('knockout');

var initialValue = -1;

function _noop() {
	return function() {};
};

module.exports = function(subscribersCount) {
	
	var testContext;
	
	global.createTestContext = function() {
		function koData() {
			var observable = ko.observable(initialValue);
			
			return {
				observable: observable
			};
		};
		
		function itDependsData() {
			var observable = itDepends.value(initialValue);
			
			return {
				observable: observable
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
	
	var suite = new Benchmark.Suite('subscribe to observable with ' + subscribersCount + ' subscribers');

	suite.add('knockout', function() {
		for (var i = 0; i < subscribersCount; i++) {
			testContext.ko.observable.subscribe(_noop());
		}
	});

	suite.add('itDepends', function() {
		for (var i = 0; i < subscribersCount; i++) {
			testContext.itDepends.observable.onChange(_noop());
		}
	});
	
	return suite;
};