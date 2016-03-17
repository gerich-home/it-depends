var gulp = require('gulp');
var coveralls = require('gulp-coveralls');

gulp.task('coveralls', ['unit-tests-only'], function() {
    return gulp.src('out/reports/coverage.lcov')
        .pipe(coveralls());
});
