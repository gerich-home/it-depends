var expect = require('chai').expect;
var itDepends = require('../out/build/it-depends.js');

describe('computed exceptions caught in other computed', function () {
	var calls;
	var observableValue;
	var computedValue;

	beforeEach(function(){
		var counter = { count: 0 };
		calls = counter;
		
		observableValue = itDepends.value('Bob');

		otherComputed = itDepends.computed(function(){
            if(observableValue() === 'Jack') {
                throw new Error('Wrong person');
            }
            
			return 'mr. ' + observableValue();
		});

		computedValue = itDepends.computed(function(){
			counter.count++;
            
            try {
			    return 'Hello, ' + otherComputed();
            } catch (e) {
			    return 'Error: ' + e.message;
            }
            
		});
	});
    
    var describeBehavior = function(initialCalls) {
        context('when changed so that calculator will throw error', function () {
            beforeEach(function() {
                observableValue.write('Jack');
            });

            it('should catch error', function () {
                expect(computedValue()).to.equal('Error: Wrong person');
                expect(calls.count).to.equal(1 + initialCalls);
            });
    
            context('when error was caught once', function () {
                beforeEach(function() {
                    computedValue();
                });

                it('should not recalculate when requested', function () {
                    expect(calls.count).to.equal(1 + initialCalls);
                });

                it('should throw the same when requested', function () {
                    expect(computedValue()).to.equal('Error: Wrong person');
                });
    
                context('when changed so that calculator will stop throwing error', function () {
                    beforeEach(function() {
                        observableValue.write('Peter');
                    });

                    it('should not throw error when requested', function () {
                        expect(computedValue()).to.equal('Hello, mr. Peter');
                        expect(calls.count).to.equal(2 + initialCalls);
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
