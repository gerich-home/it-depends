var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var coveralls = require('gulp-coveralls');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

function updateVersionTask(name, importance) {
    gulp.task(name, function() {
        return gulp.src('./package.json')
            .pipe(plugins.bump({ type: importance }))
            .pipe(gulp.dest('./'));
    });
};

console.log(process.env.APPVEYOR);
console.log(process.env.ITDEPENDS_MASTER_NOT_PR);
console.log(process.env.APPVEYOR_REPO_BRANCH);
console.log(process.env.APPVEYOR_PULL_REQUEST_NUMBER);

function mochaReporter() {
    return process.env.APPVEYOR === 'True'
        ? 'mocha-appveyor-reporter'
        : 'spec';
};

function isMasterBranchAndNotPr() {
    return process.env.ITDEPENDS_MASTER_NOT_PR === 'True';
};

updateVersionTask('patch', 'patch');
updateVersionTask('feature', 'minor');
updateVersionTask('release', 'major');

gulp.task('build', function() {
    var pkg = require('./package.json');
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

gulp.task('unit-tests', [], function() {
    return gulp.src('specs/index.js')
		.pipe(cover.instrument({
			pattern: ['src/**/*.js']
		}))
        .pipe(mocha({
            reporter: mochaReporter()
        }))
		.pipe(cover.gather())
		.pipe(cover.format(['html', 'lcov']))
		.pipe(gulp.dest('out/reports'));
});

gulp.task('coveralls', ['unit-tests'], function() {
    return gulp.src('out/reports/coverage.lcov')
        .pipe(coveralls());
});

function integrationTestTask(name, extension, runner) {
	gulp.task('integration-test-' + name, ['build'], function() {
		return gulp
			.src('integration-tests/' + name + '/index.' + extension)
			.pipe(runner());
	});
};

integrationTestTask('nodejs',         'js',   mocha);
integrationTestTask('browser-global', 'html', mochaPhantomJS);
integrationTestTask('requirejs',      'html', mochaPhantomJS);

gulp.task('integration-tests', [
	'integration-test-nodejs',
	'integration-test-requirejs',
	'integration-test-browser-global'
]);

gulp.task('all-tests', ['unit-tests', 'integration-tests']);
gulp.task('full', ['build', 'all-tests']);

if(isMasterBranchAndNotPr()) {
	gulp.task('continous-integration', ['full', 'coveralls']);
} else {
	gulp.task('continous-integration', ['full']);
}

gulp.task('default', ['full']);
