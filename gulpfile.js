var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var mocha   = require('gulp-mocha');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var gutil = require('gulp-util');

function updateVersionTask(importance) {
  return function() {
	return gulp.src('./package.json')
      .pipe(plugins.bump({ type: importance }))
      .pipe(gulp.dest('./'));
  };
};

function mochaRepoter() {
    return gutil.env.appveyor === 'true'
        ? 'mocha-appveyor'
        : 'spec';
}

gulp.task('patch',   updateVersionTask('patch'))
gulp.task('feature', updateVersionTask('minor'));
gulp.task('release', updateVersionTask('major'));

gulp.task('build', function () {
  var pkg = require('./package.json');
  var outputDir = './out/build';

  return gulp.src('./src/itDepends.js')
      .pipe(plugins.replace('{{ version }}', pkg.version))
      .pipe(gulp.dest(outputDir))
      .pipe(plugins.uglify())
      .pipe(plugins.rename('itDepends.min.js'))
      .pipe(gulp.dest(outputDir));
});

gulp.task('test', ['build'], function () {
  return gulp.src('specs/index.js')
             .pipe(mocha({
                reporter: mochaRepoter()
              }));
});

gulp.task('test-in-browser', ['build'], function () {
  return gulp
    .src('runner.html')
    .pipe(mochaPhantomJS({
                reporter: mochaRepoter()
              }));
});

gulp.task('coverage', ['build'], function () {
  return gulp.src('specs/index.js')
             .pipe(mocha({
                reporter: 'html-cov',
                require: ['blanket']
              }));
});

gulp.task('tests', ['test', 'test-in-browser']);
gulp.task('continous-integration', ['build', 'tests']);
gulp.task('default', ['build']);