var through = require('through2');

var skipCoverage = function() {
    return process.env.SKIP_COVERAGE === 'True';
};

module.exports = function(f) {
    if(!skipCoverage()) {
        return f();
    }
    
    return through.obj(function(file, enc, cb) {
        cb(null, file);
    });
}