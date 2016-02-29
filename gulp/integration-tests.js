var gulp = require('gulp');
var mocha = require('gulp-mocha');
var mochaPhantomJS = require('gulp-mocha-phantomjs');

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
