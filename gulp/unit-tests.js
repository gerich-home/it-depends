var gulp = require('gulp');
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');
var isAppveyor = require('./util/is-appveyor.js');
var ifCoverage = require('./util/if-coverage.js');

function mochaReporter() {
    return isAppveyor()
        ? 'mocha-appveyor-reporter'
        : 'spec';
}

gulp.task('unit-tests', ['build'], function() {
    return gulp.src('specs/index.js')
		.pipe(ifCoverage(function() {
            return cover.instrument({
                pattern: ['out/build/*.js']
            });
        }))
        .pipe(mocha({
            reporter: mochaReporter()
        }))
		.pipe(ifCoverage(function() {
            return cover.gather();
        }))
		.pipe(ifCoverage(function() {
            return cover.format(['html', 'lcov']);
        }))
		.pipe(gulp.dest('out/reports'));
});