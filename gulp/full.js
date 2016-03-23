var gulp = require('gulp');

gulp.task('full', ['build', 'tslint', 'all-tests']);
