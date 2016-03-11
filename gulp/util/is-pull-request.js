module.exports = function() {
    return process.env.APPVEYOR_PULL_REQUEST_NUMBER !== undefined;
};