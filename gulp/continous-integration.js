var gulp = require('gulp');

function isPullRequest() {
    return process.env.APPVEYOR_PULL_REQUEST_NUMBER !== undefined;
}

if(isPullRequest()) {
	gulp.task('continous-integration', ['full']);
} else {
	gulp.task('continous-integration', ['full', 'coveralls']);
}
