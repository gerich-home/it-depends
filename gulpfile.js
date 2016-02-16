var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var gutil = require('gulp-util');

function updateVersionTask(name, importance) {
    gulp.task(name, function() {
        return gulp.src('./package.json')
            .pipe(plugins.bump({ type: importance }))
            .pipe(gulp.dest('./'));
    });
};

function mochaRepoter() {
    return gutil.env.appveyor === 'true'
        ? 'mocha-appveyor-reporter'
        : 'spec';
};

updateVersionTask('patch', 'patch');
updateVersionTask('feature', 'minor');
updateVersionTask('release', 'major');

gulp.task('build', function() {
    var pkg = require('./package.json');
    var outputDir = './out/build';
    var libraryName = 'it-depends';

    return gulp.src('./src/' + libraryName + '.js')
        .pipe(plugins.replace('{{ version }}', pkg.version))
        .pipe(gulp.dest(outputDir))
        .pipe(plugins.uglify())
        .pipe(plugins.rename(libraryName + '.min.js'))
        .pipe(gulp.dest(outputDir));
});

gulp.task('test', [], function() {
    return gulp.src('specs/index.js')
        .pipe(mocha({
            reporter: mochaRepoter()
        }));
});

gulp.task('test-coverage', [], function() {
    return gulp.src('specs/index.js')
		.pipe(cover.instrument({
			pattern: ['src/**/*.js']
		}))
        .pipe(mocha({
            reporter: mochaRepoter()
        }))
		.pipe(cover.gather())
		.pipe(cover.format())
		.pipe(gulp.dest('out/reports'));
});

function integrationTestTask(name, extension, runner) {
	gulp.task('integration-test-' + name, ['build'], function() {
		return gulp
			.src('integration-tests/' + name + '/index.' + extension)
			.pipe(runner({
				reporter: mochaRepoter()
			}));
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

gulp.task('tests', ['test', 'integration-tests']);
gulp.task('continous-integration', ['build', 'test-coverage', 'integration-tests']);
gulp.task('default', ['build']);