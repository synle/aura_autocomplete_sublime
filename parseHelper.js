var fs = require('fs');

module.exports = {
	readFromFile: function(path){
		console.log('Reading file...'.yellow.bold);
		console.log(path.yellow);

		return fs.readFileSync(path, 'utf-8');
	},
	parseFunctions: function(functionName, functionDefition, namespaceStr){
		if(typeof functionDefition === 'function'){
			//get function definitions as string
			var funcDefStr = functionDefition.toString();
			

			//parse the params
			var paramsStr = funcDefStr.match(/\(.*\)/)[0]; // match the first (...)
			paramsStr = paramsStr.substr(1, paramsStr.length - 2); //remove ( and )

			//convert params string to array
			var params = paramsStr.split(',');
			params.forEach(function(param){
				param = param.trim();
			});


			//output
			console.log(namespaceStr.red.bold + functionName.red.bold);
			console.log(params.join('\t').blue);
		}
	}
}