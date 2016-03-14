var Benchmark = require('benchmark');
var itDepends = require('../../out/dist/it-depends.js');
var ko = require('knockout');

var initialValue = -1;

function _noop() {
	return function() {};
};

module.exports = function(readCount) {
	
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
			itDepends: itDependsData()
		};
	};
	
	Benchmark.prototype.setup = function() {
		global.createTestContext();
	};
	
	var suite = new Benchmark.Suite('read observable ' + readCount + ' times');

	suite.add('knockout', function() {
		for (var i = 0; i < readCount; i++) {
			testContext.ko.observable();
		}
	});

	suite.add('itDepends', function() {
		for (var i = 0; i < readCount; i++) {
			testContext.itDepends.observable();
		}
	});
	
	return suite;
};