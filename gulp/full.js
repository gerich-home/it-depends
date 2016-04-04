var gulp = require('gulp');

gulp.task('build-and-tests', ['build', 'all-tests']);

gulp.task('full', ['build-and-tests']);