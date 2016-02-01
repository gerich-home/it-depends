var gulp = require('gulp');
var mochaPhantomJS = require('gulp-mocha-phantomjs');

gulp.task('default', function() {
});

gulp.task('test', function () {
  return gulp
    .src('runner.html')
    .pipe(mochaPhantomJS());
});