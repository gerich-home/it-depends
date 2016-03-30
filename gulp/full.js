var gulp = require('gulp');

gulp.task('build-and-tests', ['build', 'tslint', 'all-tests']);

gulp.task('full', ['build-and-tests']);