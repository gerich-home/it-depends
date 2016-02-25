var expect = require('chai').expect;
var itDepends = require('../src/it-depends.js');

describe('usage of the library in the real world scenarios', function () {
	context('conditional computeds', function () {
		var a;
		var b;
		var c;
		var d;
		var callCount;
		
		beforeEach(function() {
			callCount = 0;
			a = itDepends.value(1);
			b = itDepends.value(2);
			c = itDepends.value(3);
			
			d = itDepends.computed(function() {
				++callCount;
				if(a() === 1) {
					return b();
				}
				else {
					return c();
				}
			});
		});
			
		it('should not recalculate immediately', function () {
			expect(callCount).to.equal(0);
		});
			
		it('should recalculate when requested', function () {
			var actualValue = d();
			
			expect(actualValue).to.equal(2);
			expect(callCount).to.equal(1);
		});
		
		context('after changes are made', function () {		
			beforeEach(function() {
				a.write(4);
				b.write(5);
				c.write(6);
			});
			
			it('should not recalculate immediately', function () {
				expect(callCount).to.equal(0);
			});
			
			it('should recalculate once when requested', function () {
				var actualValue = d();
				
				expect(actualValue).to.equal(6);
				expect(callCount).to.equal(1);
			});
			
			it('should not recalculate when requested second time', function () {
				d();
				var actualValue = d();
				
				expect(actualValue).to.equal(6);
				expect(callCount).to.equal(1);
			});
		});
	});
});
