var fs = require('fs');
var tasks = fs.readdirSync('./gulp');

tasks.forEach(function(task) {
	require('./gulp/' + task);
});