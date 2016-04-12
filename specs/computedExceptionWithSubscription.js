var expect = require('chai').expect;
var itDepends = require('../out/build/it-depends.js');
var _ = require('lodash');

describe('computed exceptions with subscriptions', function () {
	var calls;
	var observableValue;
	var computedValue;
    var subscription;
	
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

	beforeEach(function(){
		var counter = { count: 0 };
		calls = counter;
		
		observableValue = itDepends.value('Bob');

		computedValue = itDepends.computed(function() {
            if(observableValue() === 'Jack') {
                throw new Error();
            }
            
			return 'Hello, ' + observableValue();
		});

		subscription = computedValue.onChange(function(changed, from, to, args) {
			counter.count++;
			counter.lastChange = { changed: changed, from: from, to: to, args: args };
		});
	});
	
	afterEach(function() {
		subscription.disable();
	});
    
    context('when changed so that calculator will throw error', function () {
        beforeEach(function() {
            observableValue.write('Jack');
        });

        it('should not be notified about value change', function () {
            expect(calls.count).to.equal(0);
        });

        context('when changed value so that calculator will stop throwing error', function () {
            beforeEach(function() {
                observableValue.write('Peter');
            });

            it('should notify about value change', function () {
                expect(calls.count).to.equal(1);
                expectLastChanges({ changed: computedValue.withNoArgs(), from: 'Hello, Bob', to: 'Hello, Peter', args: [] });
            });
        });

        context('when reverted value so that calculator will stop throwing error', function () {
            beforeEach(function() {
                observableValue.write('Bob');
            });

            it('should not notify about value change', function () {
                expect(calls.count).to.equal(0);
            });
        });
    });
});
