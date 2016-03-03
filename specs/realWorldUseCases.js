var expect = require('chai').expect;
var itDepends = require('../out/build/it-depends.js');

describe('usage of the library in the real world scenarios', function () {
	context('conditional computeds', function () {
		var a;
		var b;
		var c;
		var d;
		var calls;
		
		beforeEach(function() {
			var counter = { count: 0 };
			calls = counter;
			
			a = itDepends.value(1);
			b = itDepends.value(2);
			c = itDepends.value(3);
			
			d = itDepends.computed(function() {
				++counter.count;
				if(a() === 1) {
					return b();
				}
				else {
					return c();
				}
			});
		});
			
		it('should not recalculate immediately', function () {
			expect(calls.count).to.equal(0);
		});
			
		it('should recalculate when requested', function () {
			var actualValue = d();
			
			expect(actualValue).to.equal(2);
			expect(calls.count).to.equal(1);
		});
		
		context('after changes are made', function () {		
			beforeEach(function() {
				a.write(4);
				b.write(5);
				c.write(6);
			});
			
			it('should not recalculate immediately', function () {
				expect(calls.count).to.equal(0);
			});
			
			it('should recalculate once when requested', function () {
				var actualValue = d();
				
				expect(actualValue).to.equal(6);
				expect(calls.count).to.equal(1);
			});
			
			it('should not recalculate when requested second time', function () {
				d();
				var actualValue = d();
				
				expect(actualValue).to.equal(6);
				expect(calls.count).to.equal(1);
			});
		});
		
		context('after was requested', function () {		
			beforeEach(function() {
				d();
			});
			
			it('should not recalculate when requested after a change is made to false condition branch variable', function () {
				c.write(6);

				var actualValue = d();
				
				expect(actualValue).to.equal(2);
				expect(calls.count).to.equal(1);
			});
		});
	});
});
