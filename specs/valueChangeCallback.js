var expect = require('chai').expect;
var itDepends = require('../src/it-depends.js');

describe('value change callback', function () {
	var calls;
	var observableValue;
	var subscription;
	var lastChange;
	
	var expectLastChanges = function(expected) {
		expect(lastChange.changed).to.equal(expected.changed);
		expect(lastChange.from).to.equal(expected.from);
		expect(lastChange.to).to.equal(expected.to);
	};

	beforeEach(function() {
		var counter = { count: 0 };
		calls = counter;

		observableValue = itDepends.value('Bob');

		subscription = observableValue.onChange(function(changed, from, to) {
			counter++;
			lastChange = { changed: changed, from: from, to: to };
		});
	});
	
	afterEach(function() {
		subscription.disable();
	});
	
	it('should not be triggered when new subscription is created', function () {
		expect(calls.count).to.equal(0);
	});

	it('should not be triggered when observable is not changed', function () {
		observableValue.write('Bob');
		expect(calls.count).to.equal(0);
	});
	
	context('when observable is changed', function() {
		beforeEach(function() {
			observableValue.write('Jack');
		});

		it('should be triggered once', function () {
			expect(calls.count).to.equal(1);
			expectLastChanges({ changed: observableValue, from: 'Bob', to: 'Jack' });
		});

		it('should be triggered once when changed back', function () {
			observableValue.write('Bob');
			expect(calls.count).to.equal(2);
			expectLastChanges({ changed: observableValue, from: 'Jack', to: 'Bob' });
		});
	});
	
	it('should not be triggered when other observable is changed', function () {
		var otherValue = itDepends.value('Jack');
		otherValue.write('James');
		
		expect(calls.count).to.equal(0);
	});
	
	context('when disabled', function() {
		beforeEach(function() {
			subscription.disable();
		});
	
		it('should not be triggered when observable is changed', function () {
			observableValue.write('Jack');
			
			expect(calls.count).to.equal(0);
		});

		context('when enabled back', function() {
			beforeEach(function() {
				subscription.enable();
			});
		
			it('should be triggered when observable is changed', function () {
				observableValue.write('Jack');
				
				expect(calls.count).to.equal(1);
				expectLastChanges({ changed: observableValue, from: 'Bob', to: 'Jack' });
			});
		});
	});
});
