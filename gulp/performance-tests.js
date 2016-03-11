var gulp = require('gulp');
var fail = require('gulp-fail');
var gulpIf = require('gulp-if');
var benchmark = require('gulp-benchmark');
var _ = require('lodash');
var isAppveyor = require('./util/is-appveyor.js');

var timesItDependsMustBeFaster = 1.05;
var slowTestSuites;

function getSlowTestSuites(file) {
	var report = JSON.parse(file.contents);
	
	return _(report)
		.filter(function(testSuite) {
			var tests = _(testSuite.results)
				.keyBy('name')
				.value();
			
			var itDependsHz = tests.itDepends.hz;
			
			var testsThatAreSlower = _(tests)
				.omit('itDepends')
				.filter(function(test) {
					return itDependsHz / test.hz < timesItDependsMustBeFaster;
				})
				.value();
			
			return testsThatAreSlower.length > 0;
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
		.pipe(gulp.dest('./out/reports'))
		.pipe(gulpIf(function(file) {
			if(isAppveyor()) {
				return false;
			}
			
			slowTestSuites = getSlowTestSuites(file);
			
			return slowTestSuites.length > 0;
		},
		fail(function() {
			return 'it-depends is too slow (threshold is ' + timesItDependsMustBeFaster + ') comparing other tests in the following test suites: [\n' +
				_(slowTestSuites).map('name').value().join(',\n') + '\n]';
		}, true)));
});