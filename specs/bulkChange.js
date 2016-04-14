var expect = require('chai').expect;
var itDepends = require('../out/build/it-depends.js');
var _ = require('lodash');

describe('bulk change', function () {
	var initial;
	var observableValue;
	var otherObservableValue;
	var computedValue;
	var atStartOfBulkChangeCallbacks;
	var atEndOfBulkChangeCallbacks;
	
    var subscribeWithSpies = function() {
        var calls = {
            computedCount: 0,
            observableCount: 0,
            otherObservableCount: 0,
            generalCount: 0
        };
        
        var computedSubscription = computedValue.onChange(function(changed, from, to, args) {
            calls.computedCount++;
            calls.lastComputedChange = { changed: changed, from: from, to: to, args: args };
        });

        var observableSubscription = observableValue.onChange(function(changed, from, to) {
            calls.observableCount++;
            calls.lastObservableChange = { changed: changed, from: from, to: to };
        });

        var otherObservableSubscription = otherObservableValue.onChange(function(changed, from, to) {
            calls.otherObservableCount++;
            calls.lastOtherObservableChange = { changed: changed, from: from, to: to };
        });

        var generalSubscription = itDepends.onChange(function(changed, from, to) {
            calls.generalCount++;
            calls.lastGeneralChange = { changed: changed, from: from, to: to };
        });
        
        calls.unsubscribe = function() {
            computedSubscription.disable();
            observableSubscription.disable();
            otherObservableSubscription.disable();
            generalSubscription.disable();
        };
    
        return calls;
    }
    
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

	beforeEach(function() {
        atStartOfBulkChangeCallbacks = [];
        atEndOfBulkChangeCallbacks = [];

		observableValue = itDepends.value('Bob');
		otherObservableValue = itDepends.value('Hello');
		computedValue = itDepends.computed(function() {
			return otherObservableValue() + ', ' + observableValue();
		});
        
        initial = subscribeWithSpies();
	});
	
	afterEach(function() {
        initial.unsubscribe();
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
                expect(initial.computedCount).to.equal(0);
                expect(initial.observableCount).to.equal(0);
                expect(initial.generalCount).to.equal(0);
            });
            
            doBulkChange();
		});
        
		it('should be triggered when bulk change ends', function () {
            doBulkChange();
            
            expect(initial.computedCount).to.equal(1);
            expect(initial.observableCount).to.equal(1);
            expect(initial.otherObservableCount).to.equal(0);
            expect(initial.generalCount).to.equal(1);
			expectChange(initial.lastComputedChange, { changed: computedValue.withNoArgs(), from: 'Hello, Bob', to: 'Hello, Jack', args: [] });
			expectChange(initial.lastObservableChange, { changed: observableValue, from: 'Bob', to: 'Jack' });
			expectChange(initial.lastGeneralChange, { changed: observableValue, from: 'Bob', to: 'Jack' });
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
                
                expect(initial.computedCount).to.equal(0);
                expect(initial.observableCount).to.equal(0);
                expect(initial.generalCount).to.equal(0);
                expect(initial.otherObservableCount).to.equal(0);
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
                        expect(initial.computedCount).to.equal(0);
                        expect(initial.generalCount).to.equal(0);
                        expect(initial.otherObservableCount).to.equal(0);
                    });
                    
                    doBulkChange();
                });
                
                it('should be triggered when bulk change ends', function () {
                    doBulkChange();
                    
                    expect(initial.computedCount).to.equal(1);
                    expect(initial.observableCount).to.equal(0);
                    expect(initial.otherObservableCount).to.equal(1);
                    expect(initial.generalCount).to.equal(1);
                    expect(computedValue()).to.equal('Salut, Bob');
                    expectChange(initial.lastComputedChange, { changed: computedValue.withNoArgs(), from: 'Hello, Bob', to: 'Salut, Bob', args: [] });
                    expectChange(initial.lastGeneralChange, { changed: otherObservableValue, from: 'Hello', to: 'Salut' });
                    expectChange(initial.lastOtherObservableChange, { changed: otherObservableValue, from: 'Hello', to: 'Salut' });
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
                    expect(initial.computedCount).to.equal(0);
                    expect(initial.observableCount).to.equal(0);
                    expect(initial.generalCount).to.equal(0);
                    expect(initial.otherObservableCount).to.equal(0);
                    expect(computedValue()).to.equal('Salut, Jack');
                });
                
                doBulkChange();
            });
            
            it('should be triggered when bulk change ends', function () {
                doBulkChange();
                    
                expect(initial.computedCount).to.equal(1);
                expect(initial.observableCount).to.equal(1);
                expect(initial.otherObservableCount).to.equal(1);
                expect(initial.generalCount).to.equal(2);
                expectChange(initial.lastComputedChange, { changed: computedValue.withNoArgs(), from: 'Hello, Bob', to: 'Salut, Jack', args: [] });
                expectChange(initial.lastObservableChange, { changed: observableValue, from: 'Bob', to: 'Jack' });
                expectChange(initial.lastOtherObservableChange, { changed: otherObservableValue, from: 'Hello', to: 'Salut' });
            });
        
            context('when additional subscriptions are made in bulk change block', function() {
                var additional;
                
                beforeEach(function() {
                    atStartOfBulkChange(function() {
                        additional = subscribeWithSpies();
                    });
                });
            
                context('when unsubscribing at the end of bulk change block', function() {
                    beforeEach(function() {
                        atEndOfBulkChange(function() {
                            additional.unsubscribe();
                        });
                    });
                    
                    it('inner subscriptions should not ever be triggered', function() {
                        doBulkChange();
                        
                        expect(additional.computedCount).to.equal(0);
                        expect(additional.observableCount).to.equal(0);
                        expect(additional.otherObservableCount).to.equal(0);
                        expect(additional.generalCount).to.equal(0);
                    });
                });
            
                context('when not unsubscribing at the end of bulk change block', function() {
                    afterEach(function() {
                        additional.unsubscribe();
                    });
                    
                    it('inner subscriptions should not ever be triggered', function() {
                        doBulkChange();
                        
                        expect(additional.computedCount).to.equal(0);
                        expect(additional.observableCount).to.equal(0);
                        expect(additional.otherObservableCount).to.equal(0);
                        expect(additional.generalCount).to.equal(0);
                            
                        expect(initial.computedCount).to.equal(1);
                        expect(initial.observableCount).to.equal(1);
                        expect(initial.otherObservableCount).to.equal(1);
                        expect(initial.generalCount).to.equal(2);
                        expectChange(initial.lastComputedChange, { changed: computedValue.withNoArgs(), from: 'Hello, Bob', to: 'Salut, Jack', args: [] });
                        expectChange(initial.lastObservableChange, { changed: observableValue, from: 'Bob', to: 'Jack' });
                        expectChange(initial.lastOtherObservableChange, { changed: otherObservableValue, from: 'Hello', to: 'Salut' });
                    });
            
                    context('when changing observables after additional subscriptions', function() {
                        beforeEach(function() {
                            atStartOfBulkChange(function() {
                                observableValue.write('Peter');
                                otherObservableValue.write('Bonjour');
                            });
                        });
                    
                        it('inner subscriptions should not be triggered until bulk change ends', function() {
                            atEndOfBulkChange(function() {
                                expect(additional.computedCount).to.equal(0);
                                expect(additional.observableCount).to.equal(0);
                                expect(additional.otherObservableCount).to.equal(0);
                                expect(additional.generalCount).to.equal(0);
                            });
                            
                            doBulkChange();
                            
                            expect(initial.computedCount).to.equal(1);
                            expect(initial.observableCount).to.equal(1);
                            expect(initial.otherObservableCount).to.equal(1);
                            expect(initial.generalCount).to.equal(2);
                            expectChange(initial.lastComputedChange, { changed: computedValue.withNoArgs(), from: 'Hello, Bob', to: 'Bonjour, Peter', args: [] });
                            expectChange(initial.lastObservableChange, { changed: observableValue, from: 'Bob', to: 'Peter' });
                            expectChange(initial.lastOtherObservableChange, { changed: otherObservableValue, from: 'Hello', to: 'Bonjour' });
                        });
                    
                        it('inner subscriptions should be triggered when bulk change ends', function() {
                            doBulkChange();
                            
                            expect(initial.computedCount).to.equal(1);
                            expect(initial.observableCount).to.equal(1);
                            expect(initial.otherObservableCount).to.equal(1);
                            expect(initial.generalCount).to.equal(2);
                            expectChange(initial.lastComputedChange, { changed: computedValue.withNoArgs(), from: 'Hello, Bob', to: 'Bonjour, Peter', args: [] });
                            expectChange(initial.lastObservableChange, { changed: observableValue, from: 'Bob', to: 'Peter' });
                            expectChange(initial.lastOtherObservableChange, { changed: otherObservableValue, from: 'Hello', to: 'Bonjour' });
                            
                            expect(additional.computedCount).to.equal(1);
                            expect(additional.observableCount).to.equal(1);
                            expect(additional.otherObservableCount).to.equal(1);
                            expect(additional.generalCount).to.equal(2);
                            expectChange(additional.lastComputedChange, { changed: computedValue.withNoArgs(), from: 'Salut, Jack', to: 'Bonjour, Peter', args: [] });
                            expectChange(additional.lastObservableChange, { changed: observableValue, from: 'Jack', to: 'Peter' });
                            expectChange(additional.lastOtherObservableChange, { changed: otherObservableValue, from: 'Salut', to: 'Bonjour' });
                        });
                    });
                });
            });
        });
    });
});
