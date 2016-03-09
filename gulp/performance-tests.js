var gulp = require('gulp');
var benchmark = require('gulp-benchmark');

gulp.task('performance-tests', ['build'], function () {
	return gulp
		.src('./performance-tests/*.js', {read: false})
		.pipe(benchmark({
			reporters: [
				benchmark.reporters.etalon('knockout')
			]
		}));
});