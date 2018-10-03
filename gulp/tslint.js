var gulp = require('gulp');
var tslint = require('gulp-tslint');

gulp.task('tslint', ['build-ts'], function() {
    gulp.src('src/*.ts')
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report());
});