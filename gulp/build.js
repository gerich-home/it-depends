var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var header = require('gulp-header');
var fs = require('fs');
var pkg = require('../package.json');
var sourcemaps = require('gulp-sourcemaps');
var tsify = require('tsify');

var addLicense = function() {
	return header(fs.readFileSync('./license.txt', 'utf8'), pkg);
};

gulp.task('build', ['build-ts', 'tslint'], function() {
    var outputDir = './out/dist';
    var libraryName = 'it-depends';
    
    return browserify({
            standalone: 'itDepends',
            debug: true
        })
        .add('./src/' + libraryName + '.ts')
        .plugin(tsify)
        .bundle()
        .pipe(source(libraryName + '.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(plugins.uglify())
        .pipe(addLicense())
        
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(outputDir));
});