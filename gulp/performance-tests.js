var gulp = require('gulp');
var fail = require('gulp-fail');
var gulpIf = require('gulp-if');
var benchmark = require('gulp-benchmark');
var _ = require('lodash');

var performanceTreshold = 1.02;
var slowTests;

function getSlowTests(file) {
	var report = JSON.parse(file.contents);
	
	return _(report)
		.filter(function(testSuite) {
			var tests = _(testSuite.results)
				.keyBy('name')
				.value();
			
			return tests.knockout.hz / tests.itDepends.hz > performanceTreshold;
		})
		.value();
};

gulp.task('performance-tests', ['all-tests-with-no-performance'], function () {
	return gulp
		.src('./performance-tests/tests/**/*.js', {read: false})
		.pipe(benchmark({
			reporters: [
				benchmark.reporters.etalon('knockout'),
				benchmark.reporters.json()
			]
		}))
		.pipe(gulp.dest('./out/performance'))
		.pipe(gulpIf(function(file) {
			slowTests = getSlowTests(file);
			
			return _(slowTests).size() > 0;
		},
		fail(function() {
			return "KnockoutJS is faster than it-depends on the following test cases: " +
				_(slowTests).map('name').value().join(', ');
		}, true)));
});