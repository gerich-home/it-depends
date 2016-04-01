var expect = require('chai').expect;
var itDepends = require('../out/build/it-depends.js');
var _ = require('lodash');

describe('bulk change', function () {
	var calls;
	var observableValue;
	var otherObservableValue;
	var computedValue;
	var subscription;
	var atStartOfBulkChangeCallbacks;
	var atEndOfBulkChangeCallbacks;
	
	var expectLastChanges = function(expected) {
		expect(calls.lastChange.changed).to.equal(expected.changed);
		expect(calls.lastChange.from).to.equal(expected.from);
		expect(calls.lastChange.to).to.equal(expected.to);
		var expectedCount = _(expected.args)
			.dropRightWhile(function(x) {
				return x === undefined;
			})
			.size();
			
		expect(calls.lastChange.args.length).to.equal(expectedCount);
		
		for(var i = 0; i < expectedCount; i++) {
			expect(calls.lastChange.args[i]).to.equal(expected.args[i]);
		}
	};

	beforeEach(function() {
        atStartOfBulkChangeCallbacks = [];
        atEndOfBulkChangeCallbacks = [];
		var callsSpy = { count: 0 };
		calls = callsSpy;

		observableValue = itDepends.value('Bob');
		otherObservableValue = itDepends.value('Hello');
		computedValue = itDepends.computed(function() {
			return otherObservableValue() + ', ' + observableValue();
		});

		subscription = computedValue.onChange(function(changed, from, to, args) {
			callsSpy.count++;
			callsSpy.lastChange = { changed: changed, from: from, to: to, args: args };
		});
	});
	
	afterEach(function() {
        subscription.disable();
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
            
            _(atEndOfBulkChangeCallbacks).forEach(function(c) { c(); });
        });
    };
	
	it('should not be triggered when new subscription is created', function () {
		expect(calls.count).to.equal(0);
	});

	it('should not be triggered when observable is not changed', function () {
		observableValue.write('Bob');
		expect(calls.count).to.equal(0);
	});
	
	context('when observable is changed in bulk change block', function() {
        beforeEach(function() {
            atStartOfBulkChange(function() {
                observableValue.write('Jack');
            });
		});

		it('should not be triggered until bulk change ends', function () {
            atEndOfBulkChange(function() {
                expect(calls.count).to.equal(0);
            });
            
            doBulkChange(function() {
                expect(computedValue()).to.equal('Hello, Jack');
            });
		});
        
		it('should be triggered when bulk change ends', function () {
            doBulkChange(function() {
                expect(computedValue()).to.equal('Hello, Jack');
            });
            
			expect(calls.count).to.equal(1);
			expectLastChanges({ changed: computedValue.withNoArgs(), from: 'Hello, Bob', to: 'Hello, Jack', args: [] });
		});
	
        context('when observable is changed back at the end of bulk change block', function() {
            beforeEach(function() {
                atEndOfBulkChange(function() {
                    observableValue.write('Bob');
                });
            });

            it('should not be triggered', function () {
                doBulkChange(function() {
                    for(var i = 0; i < 10; i++) {    
                        observableValue.write(i);
                        expect(computedValue()).to.equal('Hello, ' + i);
                    }
                });
            
                expect(calls.count).to.equal(0);
            });
	
            context('when other observable is changed in bulk change block', function() {
                beforeEach(function() {
                    atStartOfBulkChange(function() {
                        otherObservableValue.write('Salut');
                    });
                });

                it('should not be triggered until bulk change ends', function () {
                    atEndOfBulkChange(function() {
                        expect(calls.count).to.equal(0);
                    });
                    
                    doBulkChange(function() {
                        expect(computedValue()).to.equal('Salut, Jack');
                    });
                });
                
                it('should be triggered when bulk change ends', function () {
                    doBulkChange(function() {
                        expect(computedValue()).to.equal('Salut, Jack');
                    });
                    
                    expect(calls.count).to.equal(1);
                    expectLastChanges({ changed: computedValue.withNoArgs(), from: 'Hello, Bob', to: 'Salut, Bob', args: [] });
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
                    expect(calls.count).to.equal(0);
                });
                
                doBulkChange(function() {
                    expect(computedValue()).to.equal('Salut, Jack');
                });
            });
            
            it('should be triggered when bulk change ends', function () {
                doBulkChange(function() {
                    expect(computedValue()).to.equal('Salut, Jack');
                });
                
                expect(calls.count).to.equal(1);
                expectLastChanges({ changed: computedValue.withNoArgs(), from: 'Hello, Bob', to: 'Salut, Jack', args: [] });
            });
        });
    
    });
});
