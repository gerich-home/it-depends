var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');

gulp.task('full', ['build-and-tests']);

gulp.task('build-and-tests', ['build', 'tslint', 'all-tests']);
gulp.task('build-and-tests-and-publish', gulpSequence('build-and-tests', 'publish'));

// var isMaster = require('./util/is-master');
// var isTagWasPushed = require('./util/is-tag-was-pushed');
// if (isMaster() && isTagWasPushed()) {
//     gulp.task('full', ['build-and-tests-and-publish']);
// }
// else {
//     gulp.task('full', ['build-and-tests']);
// }

