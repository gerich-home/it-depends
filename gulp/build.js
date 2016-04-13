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
var gulpRegexp = require('gulp-regexp-sourcemaps');

var addLicense = function() {
	return header(fs.readFileSync('./license.txt', 'utf8'), pkg);
};

gulp.task('build', ['build-ts', 'tslint'], function() {
    var outputDir = './out/dist';
    var libraryName = 'it-depends';
    
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
        
        .pipe(mangleIdentifier('x', 'default'))
        
        .pipe(mangleIdentifier('a', 'getCurrentState'))
        .pipe(mangleIdentifier('b', 'notify'))
        
        .pipe(mangleIdentifier('a', 'recordUsage'))
        .pipe(mangleIdentifier('b', 'takeNextObservableId'))
        .pipe(mangleIdentifier('c', 'executeWithTracker'))
        .pipe(mangleIdentifier('d', 'lastWriteVersion'))
        
        .pipe(mangleIdentifier('a', 'stateChanged'))
        
        .pipe(mangleIdentifier('a', 'onChangeFinished'))
        .pipe(mangleIdentifier('b', 'doChange'))
        
        .pipe(mangleIdentifier('a', 'next'))
        .pipe(mangleIdentifier('b', 'prev'))
        .pipe(mangleIdentifier('c', 'handler'))
        
        .pipe(mangleIdentifier('a', 'subscribe'))
        
        .pipe(mangleIdentifier('a', 'deactivated'))
        .pipe(mangleIdentifier('b', 'activated'))
        
        .pipe(mangleIdentifier('a', 'equals'))
        .pipe(mangleIdentifier('b', 'unwrap'))
        .pipe(mangleIdentifier('c', 'storedValue'))
        .pipe(mangleIdentifier('c', 'error'))
        
        .pipe(mangleIdentifier('a', 'dependencyId'))
        .pipe(mangleIdentifier('b', 'getState'))
        .pipe(mangleIdentifier('c', 'capturedState'))
        .pipe(mangleIdentifier('d', 'observableValue'))
        .pipe(mangleIdentifier('e', 'subscription'))
        
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(outputDir));
});