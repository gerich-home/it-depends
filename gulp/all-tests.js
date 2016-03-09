var gulp = require('gulp');

gulp.task('all-tests-with-no-performance', ['unit-tests', 'integration-tests']);
gulp.task('all-tests', ['all-tests-with-no-performance', 'performance-tests']);