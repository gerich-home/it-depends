var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var header = require('gulp-header');
var fs = require('fs');
var pkg = require('../package.json');
var sourcemaps = require('gulp-sourcemaps');
var merge = require('merge2');
var tsify = require('tsify');
var gulpRegexp = require('gulp-regexp-sourcemaps');

var addLicense = function() {
	return header(fs.readFileSync('./license.txt', 'utf8'), pkg);
};

gulp.task('build', ['build-ts', 'tslint'], function() {
    var outputDir = './out/dist';
    var libraryName = 'it-depends';
    
    var build = function(minified) {
        var result = browserify({
                standalone: 'itDepends',
                debug: true
            })
            .add('./src/' + libraryName + '.ts')
            .plugin(tsify)
            .bundle()
            .pipe(source(libraryName + (minified ? '.min' : '') + '.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }));
        
        if(minified) {
            result = result.pipe(plugins.uglify());
        }
        
        var mangleModule = function(mangledModuleName, moduleName) {
            return gulpRegexp(
                new RegExp('(\\"|\\\')\\.\\/' + moduleName.replace('.', '\\.').replace('/', '\\/') + '(\\"|\\\')', 'g'),
                '"' + mangledModuleName + '"',
                '"./' + moduleName + '"')
        };
        
        var mangleIdentifier = function(mangledIdentifier, identifier) {
            return gulpRegexp(
                new RegExp('\\b' + identifier + '\\b', 'g'),
                mangledIdentifier,
                identifier)
        };
        
        return result
            .pipe(addLicense())
            
            .pipe(mangleModule('1', 'bulkChange'))
            .pipe(mangleModule('2', 'change'))
            .pipe(mangleModule('3', 'changeNotification'))
            .pipe(mangleModule('4', 'computed'))
            .pipe(mangleModule('5', 'DependencyErrorState'))
            .pipe(mangleModule('6', 'DependencyValueState'))
            .pipe(mangleModule('7', 'parametricComputed'))
            .pipe(mangleModule('8', 'promiseValue'))
            .pipe(mangleModule('9', 'subscriptionList'))
            .pipe(mangleModule('a', 'tracking'))
            .pipe(mangleModule('b', 'value'))
            .pipe(mangleModule('c', 'it-depends'))
            
            .pipe(mangleIdentifier('a', 'getCurrentState'))
            .pipe(mangleIdentifier('b', 'notify'))
            .pipe(mangleIdentifier('r', 'recordUsage'))
            .pipe(mangleIdentifier('s', 'stateChanged'))
            .pipe(mangleIdentifier('g', 'getState'))
            .pipe(mangleIdentifier('o', 'onChangeFinished'))
            .pipe(mangleIdentifier('e', 'executeWithTracker'))
            .pipe(mangleIdentifier('l', 'lastWriteVersion'))
            .pipe(mangleIdentifier('q', 'deactivated'))
            .pipe(mangleIdentifier('a', 'activated'))
            .pipe(mangleIdentifier('x', 'subscribe'))
            .pipe(mangleIdentifier('y', 'subscription'))
            .pipe(mangleIdentifier('m', 'equals'))
            .pipe(mangleIdentifier('v', 'observableValue'))
            .pipe(mangleIdentifier('i', 'dependencyId'))
            .pipe(mangleIdentifier('e', 'error'))
            .pipe(mangleIdentifier('t', 'takeNextObservableId'))
            .pipe(mangleIdentifier('d', 'default'))
            .pipe(mangleIdentifier('c', 'capturedstate'))
            .pipe(mangleIdentifier('h', 'handler'))
            .pipe(mangleIdentifier('n', 'next'))
            .pipe(mangleIdentifier('p', 'prev'))
            .pipe(mangleIdentifier('u', 'unwrap'))
            
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(outputDir));
    }
    return merge([
        build(true),
        build(false)
        ]);
});