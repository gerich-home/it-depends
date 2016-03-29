var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');

var isMaster = require('./util/is-master');
var isTagAdded = require('./util/is-tag-added');

gulp.task('build-and-tests', ['build', 'tslint', 'all-tests']);
gulp.task('build-and-tests-and-publish', gulpSequence('build-and-tests', 'publish'));

if (isMaster() && isTagAdded()) {
    gulp.task('full', ['build-and-tests-and-publish']);
}
else {
    gulp.task('full', ['build-and-tests']);
}