var gulp = require('gulp');
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');
var isAppveyor = require('./util/is-appveyor.js');
var isPullRequest = require('./util/is-pull-request.js');

function mochaReporter() {
    return isAppveyor()
        ? 'mocha-appveyor-reporter'
        : 'spec';
}

gulp.task('unit-tests-only', ['build'], function() {
    return gulp.src('specs/index.js')
		.pipe(cover.instrument({
			pattern: ['out/build/*.js']
		}))
        .pipe(mocha({
            reporter: mochaReporter()
        }))
		.pipe(cover.gather())
		.pipe(cover.format(['html', 'lcov']))
		.pipe(gulp.dest('out/reports'));
});

if(isPullRequest() || !isAppveyor()) {
	gulp.task('unit-tests', ['unit-tests-only']);
} else {
	gulp.task('unit-tests', ['unit-tests-only', 'coveralls']);
}
