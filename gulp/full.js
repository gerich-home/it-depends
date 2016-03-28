var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');

// gulp.task('full', ['build-and-tests']);

gulp.task('build-and-tests', ['build', 'tslint', 'all-tests']);
gulp.task('build-and-tests-and-publish', gulpSequence('build-and-tests', 'publish'));

var isMaster = require('./util/is-master');
var isTagWasPushed = require('./util/is-tag-was-pushed');

if (!!process.env.APPVEYOR_REPO_TAG_NAME) {
    gulp.task('full', gulpSequence('build', 'publish'));
}
else {
    gulp.task('full', ['build']);
}
// if (isMaster() && isTagWasPushed()) { // todo: we will back to master
// }
// else {
//     gulp.task('full', ['build-and-tests']);
// }