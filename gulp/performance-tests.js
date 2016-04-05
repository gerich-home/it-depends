var gulp = require('gulp');
var fail = require('gulp-fail');
var gulpIf = require('gulp-if');
var benchmark = require('gulp-benchmark');
var _ = require('lodash');
var isAppveyor = require('./util/is-appveyor.js');
var fs = require('fs');
var path = require('path');

function minimalRatio() {
	return 2 / 3;
}

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
					// TODO: Allow overrides per test be specified in some separate json config file
					return itDependsHz / test.hz < minimalRatio();
				})
				.value();

			return testsThatAreSlower.length > 0;
		})
		.value();
};

gulp.task('performance-tests', ['all-tests-with-no-performance'], function () {
	return gulp
		.src('./performance-tests/tests/**/*.js', {read: false})
		.pipe(benchmarkSetup())
		.pipe(gulp.dest('./out/reports'));
        /*
        TODO: results seem to vary on different machines (90x times faster, 50x times slover). Ignore them for now.
		.pipe(gulpIf(function(file) {
			slowTestSuites = getSlowTestSuites(file);

			return slowTestSuites.length > 0;
		},
		fail(function() {
			return 'it-depends is too slow (ratio threshold is ' + minimalRatio() + ') comparing other tests in the following test suites: [\n' +
				_(slowTestSuites).map('name').value().join(',\n') + '\n]';
		}, true)));
        */
});

var perfTestsPath = './performance-tests/tests';
var files = fs.readdirSync(perfTestsPath);
files.forEach(function (file) {
	if (!fs.lstatSync(path.join(perfTestsPath, file)).isDirectory()) return;

	gulp.task('performance-scenario-' + file, [], function () {
		return gulp
			.src(path.join(perfTestsPath, file, '/**/*.js'), {read: false})
			.pipe(benchmarkSetup())
			.pipe(gulp.dest('./out/reports'));
	});

});

function benchmarkSetup() {
	return benchmark({
		reporters: [
			benchmark.reporters.etalon('knockout'),
			benchmark.reporters.json()
		]
	});
}