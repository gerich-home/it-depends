var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var deploy = require('gulp-gh-pages');
var sequence = plugins.sequence.use(gulp);
var fs = require('fs');
var del = require('del');

var pkg = require('../package.json');

var bowerDir = './out/bower';
var distDir = './out/dist';
var bowerRepoDir = './out/bower-repo';

var bowerArtifacts = bowerDir + '/**/*';
var bowerJsonPath = './publish/bower.json';

gulp.task('bower', sequence(
    ['clean-bower-folder'],
    ['copy-license', 'copy-bower-json', 'copy-bower-artifacts', 'copy-readme'],
    'deploy-bower'
));

gulp.task('clean-bower-folder', [], function () {
    return del([bowerDir, bowerRepoDir]);
});

gulp.task('deploy-bower', [], function () {
    // todo: move repository url to env variable

    var remoteUrl = _format('https://{identity}:{authToken}@{repo}', {
        identity: '',
        authToken: '',
        repo: 'github.com/it-depends-js/it-depends-bower.git'
    });

    var deployOptions = {
        remoteUrl: remoteUrl,
        origin: 'origin',
        branch: 'bower-publish-test', // todo: 'master'
        cacheDir: bowerRepoDir,
        message: _format('{version} version was published', { version: pkg.version })
    };

    return gulp.src(bowerArtifacts).pipe(deploy(deployOptions));
});

gulp.task('copy-license', [], function () {
    return gulp.src('./license.md').pipe(gulp.dest(bowerDir));
});

gulp.task('copy-bower-artifacts', [], function () {
    return gulp.src(distDir + '/**/*').pipe(gulp.dest(bowerDir));
});

gulp.task('copy-bower-json', [], function () {
    return gulp.src(bowerJsonPath)
        .pipe(plugins.template(pkg))
        .pipe(gulp.dest(bowerDir));
});

gulp.task('copy-readme', [], function () {
    return gulp.src('./README.md')
        .pipe(_addHeader('./publish/readme.header.md'))
        .pipe(gulp.dest(bowerDir));
});

function _addHeader(fileName) {
    return plugins.header(fs.readFileSync(fileName, 'utf8'), pkg);
}

function _format(format, args) {
    var res = format;
    for (var prop in args) {
        if (!args.hasOwnProperty(prop)) return;

        res = res.replace('{' + prop + '}', args[prop]);
    }
    return res;
}