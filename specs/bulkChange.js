var expect = require('chai').expect;
var itDepends = require('../out/build/it-depends.js');
var _ = require('lodash');

describe('bulk change', function () {
	var calls;
	var observableValue;
	var otherObservableValue;
	var computedValue;
	var observableSubscription;
	var otherObservableSubscription;
	var computedSubscription;
	var generalSubscription;
	var atStartOfBulkChangeCallbacks;
	var atEndOfBulkChangeCallbacks;
	
	var expectChange = function(actual, expected) {
		expect(actual.changed).to.equal(expected.changed);
		expect(actual.from).to.equal(expected.from);
		expect(actual.to).to.equal(expected.to);
        
        if (expected.args) {
            var expectedCount = _(expected.args)
                .dropRightWhile(function(x) {
                    return x === undefined;
                })
                .size();
                
            expect(actual.args.length).to.equal(expectedCount);
            
            for(var i = 0; i < expectedCount; i++) {
                expect(actual.args[i]).to.equal(expected.args[i]);
            }
        } else {
		    expect(actual.args).to.equal(expected.args); 
        }
	};
    
	var expectLastComputedChanges = function(expected) {
		expectChange(calls.lastComputedChange, expected);
	};
    
	var expectLastObservableChanges = function(expected) {
		expectChange(calls.lastObservableChange, expected);
	};
    
	var expectLastOtherObservableChanges = function(expected) {
		expectChange(calls.lastOtherObservableChange, expected);
	};
    
	var expectLastGeneralChanges = function(expected) {
		expectChange(calls.lastGeneralChange, expected);
	};

	beforeEach(function() {
        atStartOfBulkChangeCallbacks = [];
        atEndOfBulkChangeCallbacks = [];
		var callsSpy = { computedCount: 0, observableCount: 0, otherObservableCount: 0, generalCount: 0 };
		calls = callsSpy;

		observableValue = itDepends.value('Bob');
		otherObservableValue = itDepends.value('Hello');
		computedValue = itDepends.computed(function() {
			return otherObservableValue() + ', ' + observableValue();
		});

		computedSubscription = computedValue.onChange(function(changed, from, to, args) {
			callsSpy.computedCount++;
			callsSpy.lastComputedChange = { changed: changed, from: from, to: to, args: args };
		});

		observableSubscription = observableValue.onChange(function(changed, from, to) {
			callsSpy.observableCount++;
			callsSpy.lastObservableChange = { changed: changed, from: from, to: to };
		});

		otherObservableSubscription = otherObservableValue.onChange(function(changed, from, to) {
			callsSpy.otherObservableCount++;
			callsSpy.lastOtherObservableChange = { changed: changed, from: from, to: to };
		});

		generalSubscription = itDepends.onChange(function(changed, from, to) {
			callsSpy.generalCount++;
			callsSpy.lastGeneralChange = { changed: changed, from: from, to: to };
		});
	});
	
	afterEach(function() {
        computedSubscription.disable();
        observableSubscription.disable();
        otherObservableSubscription.disable();
        generalSubscription.disable();
	});
    
    var atStartOfBulkChange = function(callback) {
		atStartOfBulkChangeCallbacks.push(callback);
    };
    
    var atEndOfBulkChange = function(callback) {
		atEndOfBulkChangeCallbacks.push(callback);
    };
    
    var doBulkChange = function(callback) {
        itDepends.bulkChange(function() {
            _(atStartOfBulkChangeCallbacks).forEach(function(c) { c(); });
            
            if(callback) {
                callback();
            }
            
            _(atEndOfBulkChangeCallbacks).reverse().forEach(function(c) { c(); });
        });
    };
	
	context('when observable is changed in bulk change block', function() {
        beforeEach(function() {
            atStartOfBulkChange(function() {
                observableValue.write('Jack');
            });
		});

		it('should not be triggered until bulk change ends', function () {
            atEndOfBulkChange(function() {
                expect(computedValue()).to.equal('Hello, Jack');
                expect(observableValue()).to.equal('Jack');
                expect(calls.computedCount).to.equal(0);
                expect(calls.observableCount).to.equal(0);
                expect(calls.generalCount).to.equal(0);
            });
            
            doBulkChange();
		});
        
		it('should be triggered when bulk change ends', function () {
            doBulkChange();
            
            expect(calls.computedCount).to.equal(1);
            expect(calls.observableCount).to.equal(1);
            expect(calls.otherObservableCount).to.equal(0);
            expect(calls.generalCount).to.equal(1);
			expectLastComputedChanges({ changed: computedValue.withNoArgs(), from: 'Hello, Bob', to: 'Hello, Jack', args: [] });
			expectLastObservableChanges({ changed: observableValue, from: 'Bob', to: 'Jack' });
			expectLastGeneralChanges({ changed: observableValue, from: 'Bob', to: 'Jack' });
            expect(computedValue()).to.equal('Hello, Jack');
            expect(observableValue()).to.equal('Jack');
		});
	
        context('when observable is changed back at the end of bulk change block', function() {
            beforeEach(function() {
                atEndOfBulkChange(function() {
                    observableValue.write('Bob');
                });
            });

            it('should not be triggered', function () {
                atEndOfBulkChange(function() {
                    expect(observableValue()).to.equal(9);
                    expect(computedValue()).to.equal('Hello, 9');
                });
            
                doBulkChange(function() {
                    for(var i = 0; i < 10; i++) {    
                        observableValue.write(i);
                    }
                });
                
                expect(calls.computedCount).to.equal(0);
                expect(calls.observableCount).to.equal(0);
                expect(calls.generalCount).to.equal(0);
                expect(calls.otherObservableCount).to.equal(0);
                expect(observableValue()).to.equal('Bob');
                expect(computedValue()).to.equal('Hello, Bob');
            });
	
            context('when other observable is changed in bulk change block', function() {
                beforeEach(function() {
                    atStartOfBulkChange(function() {
                        otherObservableValue.write('Salut');
                    });
                });

                it('should not be triggered until bulk change ends', function () {
                    atEndOfBulkChange(function() {
                        expect(computedValue()).to.equal('Salut, Jack');
                        expect(calls.computedCount).to.equal(0);
                        expect(calls.generalCount).to.equal(0);
                        expect(calls.otherObservableCount).to.equal(0);
                    });
                    
                    doBulkChange();
                });
                
                it('should be triggered when bulk change ends', function () {
                    doBulkChange();
                    
                    expect(calls.computedCount).to.equal(1);
                    expect(calls.observableCount).to.equal(0);
                    expect(calls.otherObservableCount).to.equal(1);
                    expect(calls.generalCount).to.equal(1);
                    expect(computedValue()).to.equal('Salut, Bob');
                    expectLastComputedChanges({ changed: computedValue.withNoArgs(), from: 'Hello, Bob', to: 'Salut, Bob', args: [] });
                    expectLastGeneralChanges({ changed: otherObservableValue, from: 'Hello', to: 'Salut' });
                    expectLastOtherObservableChanges({ changed: otherObservableValue, from: 'Hello', to: 'Salut' });
                });
            });
        });

        context('when other observable is changed in bulk change block', function() {
            beforeEach(function() {
                atStartOfBulkChange(function() {
                    otherObservableValue.write('Salut');
                });
            });

            it('should not be triggered until bulk change ends', function () {
                atEndOfBulkChange(function() {
                    expect(calls.computedCount).to.equal(0);
                    expect(calls.observableCount).to.equal(0);
                    expect(calls.generalCount).to.equal(0);
                    expect(calls.otherObservableCount).to.equal(0);
                    expect(computedValue()).to.equal('Salut, Jack');
                });
                
                doBulkChange();
            });
            
            it('should be triggered when bulk change ends', function () {
                doBulkChange();
                    
                expect(calls.computedCount).to.equal(1);
                expect(calls.observableCount).to.equal(1);
                expect(calls.otherObservableCount).to.equal(1);
                expect(calls.generalCount).to.equal(2);
                expectLastComputedChanges({ changed: computedValue.withNoArgs(), from: 'Hello, Bob', to: 'Salut, Jack', args: [] });
                expectLastObservableChanges({ changed: observableValue, from: 'Bob', to: 'Jack' });
                expectLastOtherObservableChanges({ changed: otherObservableValue, from: 'Hello', to: 'Salut' });
            });
        });
    
    });
});
