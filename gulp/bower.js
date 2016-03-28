var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var deploy = require('gulp-gh-pages');
var sequence = plugins.sequence.use(gulp);
var fs = require('fs');
var Q = require('q');
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
    'clone-bower-repo-and-add-new-files'
    // 'add-new-tag',
    // 'push-to-repo'
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

gulp.task('clone-bower-repo-and-add-new-files', [], function () {

    var bowerRepoUrl = _format('https://{identity}:{authToken}@{repo}', {
        identity: process.env.BOWER_REPO_PUBLISH_IDENTITY,
        authToken: process.env.BOWER_REPO_PUBLISH_TOKEN,
        repo: process.env.BOWER_REPO
    });

    var commitMessage = _format('{version} version was published', {version: pkg.version});

    var deployOptions = {
        remoteUrl: bowerRepoUrl,
        origin: 'origin',
        branch: process.env.BOWER_BRANCH,
        cacheDir: out.repo,
        message: commitMessage,
        tag: process.env.APPVEYOR_REPO_TAG_NAME,
        // push: false // don't push after committing, wait for adding tag to commit
    };

    return gulp.src(files.bower).pipe(deploy(deployOptions));
});

// gulp.task('add-new-tag', [], function (cb) {
//     plugins.git.tag(process.env.APPVEYOR_REPO_TAG_NAME, out.repo, function (err) {
//         if (err) return cb(err);
//
//         cb();
//     });
// });
//
// gulp.task('push-to-repo', [], function (cb) {
//     plugins.git.push('origin', process.env.BOWER_BRANCH, {args: '--tags', cwd: out.repo/*, quiet: true*/}, function (err) {
//         if (err) return cb(err);
//
//         cb();
//     });
// });

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