var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var header = require('gulp-header');
var fs = require('fs');
var pkg = require('../package.json');

var addLicense = function() {
	return header(fs.readFileSync('./license.txt', 'utf8'), pkg);
};

gulp.task('build', ['build-ts'], function() {
    var outputDir = './out/dist';
    var libraryName = 'it-depends';
	var b = browserify({
		entries: './out/build/' + libraryName + '.js',
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