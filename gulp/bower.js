var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var deploy = require('gulp-gh-pages');
var sequence = plugins.sequence.use(gulp);
var fs = require('fs');
var del = require('del');

var pkg = require('../package.json');

var out = {
    bower: './out/bower',
    repo: './out/bower-repo'
};

var files = {
    dist: './out/dist/**/*',
    bower: out.bower + '/**/*'
};

gulp.task('bower', sequence(
    'clean-bower-folder',
    ['copy-license', 'copy-bower-json', 'copy-bower-artifacts', 'copy-readme'],
    'deploy-bower'
));

gulp.task('clean-bower-folder', [], function () {
    return del([out.bower, out.repo]);
});

gulp.task('copy-license', [], function () {
    return gulp.src('./license.md').pipe(gulp.dest(out.bower));
});

gulp.task('copy-bower-artifacts', [], function () {
    return gulp.src(files.dist).pipe(gulp.dest(out.bower));
});

gulp.task('copy-bower-json', [], function () {
    var bowerJsonPath = './publish/bower.json';
    return gulp.src(bowerJsonPath)
        .pipe(plugins.template(pkg))
        .pipe(gulp.dest(out.bower));
});

gulp.task('copy-readme', [], function () {
    return gulp.src('./README.md')
        .pipe(_addHeader('./publish/readme.header.md'))
        .pipe(gulp.dest(out.bower));
});

gulp.task('deploy-bower', [], function () {

    var bowerRepoUrl = _format('https://{identity}:{authToken}@{repo}', {
        identity: process.env.BOWER_REPO_PUBLISH_IDENTITY,
        authToken: process.env.BOWER_REPO_PUBLISH_TOKEN,
        repo: process.env.BOWER_REPO
    });

    var commitMessage = _format('{version} version was published', { version: pkg.version });

    var deployOptions = {
        remoteUrl: bowerRepoUrl,
        origin: 'origin',
        branch: process.env.BOWER_BRANCH,
        cacheDir: out.repo,
        message: commitMessage
    };

    return gulp.src(files.bower).pipe(deploy(deployOptions));
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