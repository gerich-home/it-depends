var expect = require('chai').expect;
var itDepends = require('../src/it-depends.js');

describe('general change callback', function () {
	var callCount;
	var observableValue;
	var subscription;
	var lastChange;
	
	var expectLastChanges = function(expected) {
		expect(lastChange.changed).to.equal(expected.changed);
		expect(lastChange.from).to.equal(expected.from);
		expect(lastChange.to).to.equal(expected.to);
	};


	beforeEach(function() {
		callCount = 0;

		observableValue = itDepends.value('Bob');

		subscription = itDepends.onChange(function(changed, from, to) {
			callCount++;
			lastChange = { changed: changed, from: from, to: to };
		});
	});
	
	afterEach(function() {
		subscription.disable();
	});
	
	it('should not be triggered when new subscription is created', function () {
		expect(callCount).to.equal(0);
	});
	
	context('when when observable is changed', function() {
		beforeEach(function() {
			observableValue.write('Jack');
		});

		it('should be triggered once', function () {
			expect(callCount).to.equal(1);
			expectLastChanges({ changed: observableValue, from: 'Bob', to: 'Jack' });
		});

		it('should be triggered once when changed back', function () {
			observableValue.write('Bob');
			expect(callCount).to.equal(2);
			expectLastChanges({ changed: observableValue, from: 'Jack', to: 'Bob' });
		});
	});
	
	context('when other observable value is created', function() {
		var otherValue;
		
		beforeEach(function() {
			otherValue = itDepends.value('Jack');
		});
		
		it('should not be triggered when other observable is created', function () {
			expect(callCount).to.equal(0);
		});
	
		it('should be triggered once when observable is changed', function () {
			observableValue.write('Jack');
			
			expect(callCount).to.equal(1);
			expectLastChanges({ changed: observableValue, from: 'Bob', to: 'Jack' });
		});
	
		it('should be triggered once when other observable is changed', function () {
			otherValue.write('James');
			
			expect(callCount).to.equal(1);
			expectLastChanges({ changed: otherValue, from: 'Jack', to: 'James' });
		});
	});
	
	context('when there is a computed depending on observable value', function() {
		var computedValue;
		
		beforeEach(function() {
			computedValue = itDepends.computed(function() {
				return "Hello, " + observableValue();
			});
		});
	
		it('should be triggered once when observable is changed', function () {
			observableValue.write('Jack');
			
			expect(callCount).to.equal(1);
			expectLastChanges({ changed: observableValue, from: 'Bob', to: 'Jack' });
		});
	});
	
	context('when disabled', function() {
		beforeEach(function() {
			subscription.disable();
		});
	
		it('should not be triggered when observable is changed', function () {
			observableValue.write('Jack');
			
			expect(callCount).to.equal(0);
		});

		context('when enabled back', function() {
			beforeEach(function() {
				subscription.enable();
			});
		
			it('should be triggered when observable is changed', function () {
				observableValue.write('Jack');
				
				expect(callCount).to.equal(1);
				expectLastChanges({ changed: observableValue, from: 'Bob', to: 'Jack' });
			});
		});
	});
});
