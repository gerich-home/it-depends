var gulp = require('gulp');
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');

function mochaReporter() {
    return 'spec';
}

gulp.task('unit-tests', [], function() {
    return gulp.src('specs/index.js')
		.pipe(cover.instrument({
			pattern: ['src/**/*.js']
		}))
        .pipe(mocha({
            reporter: mochaReporter()
        }))
		.pipe(cover.gather())
		.pipe(cover.format(['html', 'lcov']))
		.pipe(gulp.dest('out/reports'));
});