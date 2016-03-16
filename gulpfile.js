var fs = require('fs');
var tasks = fs.readdirSync('./gulp');

tasks.forEach(function(task) {
	var path = './gulp/' + task;
	if(fs.lstatSync(path).isFile()) {
		require(path);
	}
});