var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');

gulp.task('build-ts', function() {
	var tsProject = ts.createProject('./tsconfig.json');
	
	var tsResult = gulp.src('src/*.ts')
		.pipe(ts(tsProject));
 
	return merge([
		tsResult.dts.pipe(gulp.dest('./out/definitions')),
		tsResult.js.pipe(gulp.dest('./out/build'))
	]);
});