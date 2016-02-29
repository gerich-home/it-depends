var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

gulp.task('build', function() {
    var pkg = require('../package.json');
    var outputDir = './out/build';
    var libraryName = 'it-depends';
	var b = browserify({
		entries: './src/' + libraryName + '.js',
		standalone: 'itDepends'
	});
	
    return b.bundle()
		.pipe(source(libraryName + '.js'))
		.pipe(buffer())
        .pipe(plugins.replace('{{ version }}', pkg.version))
        .pipe(gulp.dest(outputDir))
        .pipe(plugins.uglify())
        .pipe(plugins.rename(libraryName + '.min.js'))
        .pipe(gulp.dest(outputDir));
});