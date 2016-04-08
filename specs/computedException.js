var expect = require('chai').expect;
var itDepends = require('../out/build/it-depends.js');

describe('computed exceptions', function () {
	var calls;
	var observableValue;
	var computedValue;

	beforeEach(function(){
		var counter = { count: 0, throwsCount: 0 };
		calls = counter;
		
		observableValue = itDepends.value('Bob');

		computedValue = itDepends.computed(function() {
			counter.count++;
            if(observableValue() === 'Jack') {
                counter.throwsCount++;
                throw new Error(counter.throwsCount);
            }
            
			return 'Hello, ' + observableValue();
		});
	});
    
    var describeBehavior = function(initialCalls) {
        context('when changed so that calculator will throw error', function () {
            beforeEach(function() {
                observableValue.write('Jack');
            });

            it('should throw error when requested', function () {
                expect(computedValue).to.throw(Error, calls.throwsCount.toString);
                expect(calls.count).to.equal(1 + initialCalls);
                expect(calls.throwsCount).to.equal(1);
            });
    
            context('when error was thrown', function () {
                beforeEach(function() {
                    try {
                        computedValue();
                    } catch(e) {
                    }
                });

                it('should not recalculate when requested', function () {
                    expect(calls.count).to.equal(1 + initialCalls);
                });

                it('should throw the same error when requested', function () {
                    expect(computedValue).to.throw(Error, calls.throwsCount.toString);
                });
    
                context('when changed so that calculator will stop throwing error', function () {
                    beforeEach(function() {
                        observableValue.write('Peter');
                    });

                    it('should not throw error when requested', function () {
                        expect(computedValue()).to.equal('Hello, Peter');
                        expect(calls.count).to.equal(2 + initialCalls);
                        expect(calls.throwsCount).to.equal(1);
                    });
                });
            });
        });
    };
    
    describeBehavior(0);
    
	context('after was calculated once', function () {
		beforeEach(function() {
			computedValue();
		});
        
        describeBehavior(1);
    });
});
