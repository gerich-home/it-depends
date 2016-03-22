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
		}
		
		var koobservable = ko.observable(initialValue);
		var idobservable = itDepends.value(initialValue);
		
		var kocomputed = ko.pureComputed(function() {
			return koobservable();
		});
		
		var idcomputed = itDepends.computed(function() {
			return idobservable();
		}).withNoArgs();

		for(var i = 0; i < subscribersCount; ++i) {
			kocomputed.subscribe(_noop());
		}

		for(var i = 0; i < subscribersCount; ++i) {
			idcomputed.onChange(_noop());
		}
	};
	
	var suite = new Benchmark.Suite('computed updated ' + updatesCount + ' times with ' + subscribersCount + ' subscribers');

	suite.add('knockout', function() {
		for (var j = 0; j < updatesCount; j++) {
			koobservable(j);
		}
	});

	suite.add('itDepends', function() {
		for (var j = 0; j < updatesCount; j++) {
			idobservable.write(j);
		}
	});

	return suite;
};
