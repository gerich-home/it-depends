var expect = require('chai').expect;
var itDepends = require('../src/it-depends.js');

describe('general change callback', function () {
	var calls;
	var observableValue;
	var subscription;
	
	var expectLastChanges = function(expected) {
		expect(calls.lastChange.changed).to.equal(expected.changed);
		expect(calls.lastChange.from).to.equal(expected.from);
		expect(calls.lastChange.to).to.equal(expected.to);
	};


	beforeEach(function() {
		var callsSpy = { count: 0 };
		calls = callsSpy;

		observableValue = itDepends.value('Bob');

		subscription = itDepends.onChange(function(changed, from, to) {
			callsSpy.count++;
			callsSpy.lastChange = { changed: changed, from: from, to: to };
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
	
	context('when other observable value is created', function() {
		var otherValue;
		
		beforeEach(function() {
			otherValue = itDepends.value('Jack');
		});
		
		it('should not be triggered when other observable is created', function () {
			expect(calls.count).to.equal(0);
		});
	
		it('should be triggered once when observable is changed', function () {
			observableValue.write('Jack');
			
			expect(calls.count).to.equal(1);
			expectLastChanges({ changed: observableValue, from: 'Bob', to: 'Jack' });
		});
	
		it('should be triggered once when other observable is changed', function () {
			otherValue.write('James');
			
			expect(calls.count).to.equal(1);
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
			
			expect(calls.count).to.equal(1);
			expectLastChanges({ changed: observableValue, from: 'Bob', to: 'Jack' });
		});
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
