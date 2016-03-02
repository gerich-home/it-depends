var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var header = require('gulp-header');
var fs = require('fs');
var pkg = require('../package.json');
var ts = require('gulp-typescript');
var merge = require('merge2');

var addLicense = function() {
	return header(fs.readFileSync('./license.txt', 'utf8'), pkg);
};

gulp.task('build-ts', function() {
	var tsProject = ts.createProject('./tsconfig.json');
	
	var tsResult = gulp.src('src/*.ts')
		.pipe(ts(tsProject));
 
	return merge([
		tsResult.dts.pipe(gulp.dest('./out/definitions')),
		tsResult.js.pipe(gulp.dest('./out/build'))
	]);
});

gulp.task('build', ['build-ts'], function() {
    var outputDir = './out/build';
    var libraryName = 'it-depends';
	var b = browserify({
		entries: './src/' + libraryName + '.js',
		standalone: 'itDepends'
	});
	
    return b.bundle()
		.pipe(source(libraryName + '.js'))
		.pipe(buffer())
		.pipe(addLicense())
        .pipe(gulp.dest(outputDir))
        .pipe(plugins.uglify())
		.pipe(addLicense())
        .pipe(plugins.rename(libraryName + '.min.js'))
        .pipe(gulp.dest(outputDir));
});