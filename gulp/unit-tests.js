var gulp = require('gulp');
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');

function mochaReporter() {
    return process.env.APPVEYOR === 'True'
        ? 'mocha-appveyor-reporter'
        : 'spec';
}

gulp.task('unit-tests', ['build'], function() {
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