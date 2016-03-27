var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var deploy = require('gulp-gh-pages');
var fs = require('fs');
var sequence = plugins.sequence.use(gulp);

var del = require('del');

var bowerPkg = require('../publish/bower.json');
var pkg = require('../package.json');

var publishDir = './out/publish';
var bowerDir = './out/bower';
var bowerArtifacts = bowerDir + '/**/*';
var bowerJsonPath = './publish/bower.json';
var distPath = './out/dist';
var bowerRepoDir = './out/bower-repo';

gulp.task('bower', sequence(
    ['clean-bower-folder'],
    ['copy-license', 'copy-bower-json', 'copy-bower-artifacts', 'copy-readme']
    // 'deploy-bower'
));

gulp.task('clean-bower-folder', [], function () {
    return del([bowerDir, bowerRepoDir, publishDir]);
});

gulp.task('deploy-bower', [], function () {
    // todo: move repository url to env variable
    var repoUrl = bowerPkg.homepage;

    var deployOptions = {// todo: remote
        origin: 'origin',
        branch: 'bower-publish-test', // todo: 'master'
        cacheDir: bowerRepoDir
    };

    return gulp.src(bowerArtifacts).pipe(deploy(deployOptions));
});

gulp.task('copy-license', [], function () {
    return gulp.src('./license.md').pipe(gulp.dest(bowerDir));
});

gulp.task('copy-bower-artifacts', [], function () {
    return gulp.src(distPath + '/**/*').pipe(gulp.dest(bowerDir));
});

gulp.task('copy-bower-json', [], function () {
    return gulp.src(bowerJsonPath)
        .pipe(plugins.template(pkg))
        .pipe(gulp.dest(bowerDir));
});

gulp.task('copy-readme', [], function () {
    return gulp.src('./README.md')
        .pipe(_addHeader('./publish/header.md'))
        .pipe(gulp.dest(bowerDir));
});

function _addHeader(fileName) {
    return plugins.header(fs.readFileSync(fileName, 'utf8'), pkg);
}