var expect = require('chai').expect;
var itDepends = require('../out/build/it-depends.js');

describe('computed', function () {
		
	it('should not be writable by default', function () {
		var computedValue = itDepends.computed(function() {
			return 1;
		});
		
		expect(computedValue).to.not.include.keys('write');
	});
		
	describe('created with write callback', function () {
		var observableValue;
		var computedValue;
		var calls;
		
		beforeEach(function() {
			var counter = { readCount: 0, writeCount: 0 };
			calls = counter;
			
			observableValue = itDepends.value(1);
			computedValue = itDepends.computed(function() {
				++counter.readCount;
				return observableValue() + 1;
			}, function(newValue, args, changed) {
				++counter.writeCount;
				counter.args = args;
				counter.changed = changed;
				observableValue.write(newValue - 1);
			});
		});
		
		it('should be writable', function () {
			expect(computedValue).to.include.keys('write');
		});
		
		context('with no arguments', function(){
			it('should call write callback on write', function () {
				computedValue.write(3);
				
				expect(observableValue()).to.equal(2);
				expect(calls.readCount).to.equal(0);
				expect(calls.writeCount).to.equal(1);
				expect(calls.args.length).to.equal(0);
				expect(calls.changed).to.equal(computedValue.withNoArgs());
			});
			
			it('should recalculate when requested after write', function () {
				computedValue.write(3);
				
				var actualValue = computedValue();
				
				expect(actualValue).to.equal(3);
				expect(calls.readCount).to.equal(1);
				expect(calls.writeCount).to.equal(1);
				expect(calls.args.length).to.equal(0);
				expect(calls.changed).to.equal(computedValue.withNoArgs());
			});
			
			it('should not protect from writing the same value twice', function () {
				computedValue.write(2);
				
				expect(observableValue()).to.equal(1);
				expect(calls.readCount).to.equal(0);
				expect(calls.writeCount).to.equal(1);
				expect(calls.args.length).to.equal(0);
				expect(calls.changed).to.equal(computedValue.withNoArgs());
			});
		});
		
		context('with argument', function(){
			it('should call write callback on write', function () {
				computedValue.withArgs(10).write(3);
				
				expect(observableValue()).to.equal(2);
				expect(calls.readCount).to.equal(0);
				expect(calls.writeCount).to.equal(1);
				expect(calls.args).to.eql([10]);
				expect(calls.changed).to.equal(computedValue.withArgs(10));
			});
			
			it('should recalculate when requested after write', function () {
				computedValue.withArgs(10).write(3);
				
				var actualValue = computedValue(10);
				
				expect(actualValue).to.equal(3);
				expect(calls.readCount).to.equal(1);
				expect(calls.writeCount).to.equal(1);
				expect(calls.args).to.eql([10]);
				expect(calls.changed).to.equal(computedValue.withArgs(10));
			});
			
			it('should not protect from writing the same value twice', function () {
				computedValue.withArgs(10).write(2);
				
				expect(observableValue()).to.equal(1);
				expect(calls.readCount).to.equal(0);
				expect(calls.writeCount).to.equal(1);
				expect(calls.args).to.eql([10]);
				expect(calls.changed).to.equal(computedValue.withArgs(10));
			});
		});
	});
});
