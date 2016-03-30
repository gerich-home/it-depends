var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var sequence = plugins.sequence.use(gulp);

var fs = require('fs');
var del = require('del');
var path = require('path');
var deploy = require('gh-pages');

var env = process.env;
var pkg = require('../package.json');

var out = {
    bower: './out/bower',
    repo: './out/bower-repo'
};

gulp.task('bower', sequence(
    'clean-bower-folder',
    ['copy-license', 'copy-bower-json', 'copy-bower-artifacts', 'copy-readme'],
    'publish-bower-repo'
));

gulp.task('clean-bower-folder', [], function () {
    return del([out.bower, out.repo]);
});

gulp.task('copy-license', [], function () {
    return gulp.src('./license.md').pipe(gulp.dest(out.bower));
});

gulp.task('copy-bower-artifacts', [], function () {
    var distFiles = './out/dist/**/*';
    return gulp.src(distFiles).pipe(gulp.dest(out.bower));
});

gulp.task('copy-bower-json', [], function () {
    var bowerJsonPath = './publish/bower.json';
    return gulp.src(bowerJsonPath)
        .pipe(plugins.template(pkg))
        .pipe(gulp.dest(out.bower));
});

gulp.task('copy-readme', [], function () {
    return gulp.src('./README.md')
        .pipe(addHeader('./publish/readme.header.md'))
        .pipe(gulp.dest(out.bower));
});

gulp.task('publish-bower-repo', [], function (cb) {

    // todo: maybe should be moved to appveyor.yml
    var bowerRepoUrl = format('https://{identity}:{authToken}@{repo}', {
        identity: env.BOWER_REPO_PUBLISH_IDENTITY,
        authToken: env.BOWER_REPO_PUBLISH_TOKEN,
        repo: env.BOWER_REPO
    });

    var commitMessage = format('{version} version was published', {version: env.APPVEYOR_REPO_TAG_NAME});

    deploy.publish(path.join(__dirname, '../out/bower'), {
        repo: bowerRepoUrl,
        branch: env.BOWER_BRANCH,
        remote: 'origin',
        tag: env.APPVEYOR_REPO_TAG_NAME,
        clone: path.join(__dirname, '../out/bower-repo'),
        message: commitMessage,
        silent: true
    }, cb);
});

function addHeader(fileName) {
    return plugins.header(fs.readFileSync(fileName, 'utf8'), pkg);
}

function format(format, args) {
    var res = format;
    for (var prop in args) {
        if (!args.hasOwnProperty(prop)) return;

        res = res.replace('{' + prop + '}', args[prop]);
    }
    return res;
}