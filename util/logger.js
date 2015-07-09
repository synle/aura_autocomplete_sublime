var colors = require('colors');

module.exports = {
	error: function(){
		console.error.apply(null, arguments);

		//write error to files
	},
	info: function(){
		if (process.env.debug){
			console.log.apply(this, arguments);	
		}
	},
	debug: function(){
		if (process.env.debug){
			console.log.apply(this, arguments);
		}
	},
	log: function(){
		console.log.apply(this, arguments);
	}
};