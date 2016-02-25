var fs = require('fs');
var specs = fs.readdirSync('./specs');

specs.forEach(function(spec) {
	require('./' + spec);
});