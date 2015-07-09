var colors = require('colors');

module.exports = {
	error: function(){
		console.error.apply(null, arguments);

		//write error to files
	},
	info: function(){
		if (parseInt(process.env.debug) >= 2){
			console.log.apply(this, arguments);	
		}
	},
	debug: function(){
		if (parseInt(process.env.debug) >= 1){
			console.log.apply(this, arguments);
		}
	},
	log: function(){
		console.log.apply(this, arguments);
	}
};