module.exports = function() {
    return !!process.env.APPVEYOR_REPO_TAG_NAME;
};