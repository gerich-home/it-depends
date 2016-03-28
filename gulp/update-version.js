var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

// todo: maybe update bower.json version too?
function updateVersionTask(name, importance) {
    gulp.task(name, function() {
        return gulp.src('./package.json')
            .pipe(plugins.bump({ type: importance }))
            .pipe(gulp.dest('./'));
    });
}

updateVersionTask('patch', 'patch');
updateVersionTask('feature', 'minor');
updateVersionTask('release', 'major');