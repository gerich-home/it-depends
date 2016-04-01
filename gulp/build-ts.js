var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('build-ts', function() {
	var tsProject = ts.createProject('./tsconfig.json');
	
	var tsResult = gulp.src('src/*.ts')
        .pipe(sourcemaps.init())
		.pipe(ts(tsProject));

    var js = tsResult.js
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./out/build'));

    var dts = tsResult.dts
            .pipe(gulp.dest('./out/definitions'));
            
	return merge([dts, js]);
});