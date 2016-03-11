var gulp = require('gulp');
var isPullRequest = require('./util/is-pull-request.js');

if(isPullRequest()) {
	gulp.task('continous-integration', ['full']);
} else {
	gulp.task('continous-integration', ['full', 'coveralls']);
}
