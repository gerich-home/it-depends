var Benchmark = require('benchmark');
var itDepends = require('../../out/dist/it-depends.js');
var ko = require('knockout');

module.exports = function(readCount) {
	Benchmark.prototype.args = {
		readCount: readCount,
		ko: ko,
		itDepends: itDepends
	};
	
	Benchmark.prototype.setup = function() {
		var readCount = this.args.readCount;
		var ko = this.args.ko;
		var itDepends = this.args.itDepends;
		
		var initialValue = -1;
		
		var koobservable = ko.observable(initialValue);
		var idobservable = itDepends.value(initialValue);
	};
	
	var suite = new Benchmark.Suite('read observable ' + readCount + ' times');

	suite.add('knockout', function() {
		for (var i = 0; i < readCount; i++) {
			var x = koobservable();
		}
	});

	suite.add('itDepends', function() {
		for (var i = 0; i < readCount; i++) {
			var x = idobservable();
		}
	});
	
	return suite;
};