var gulp = require('gulp');

function isPullRequest() {
    return process.env.APPVEYOR_PULL_REQUEST_NUMBER !== undefined;
}

if(isPullRequest()) {
	gulp.task('continous-integration', ['full', 'performance-tests']);
} else {
	gulp.task('continous-integration', ['full', 'performance-tests', 'coveralls']);
}
