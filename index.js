//depdencies
var path = require('path');
var fs = require('fs');
var colors = require('colors');
var prompt = require('prompt');
var parseString = require('xml2js').parseString;

//internal dependencies
var parseHelper = require('./util/parseHelper');
var config = require('./config');
var promptSchema = config.prompt;


//internal dependencies
var generateXmlAutoComplete = require('./util/generateXmlAutoComplete');
var generateJsAutoComplete = require('./util/generateJsAutoComplete');

if (process.env.baseDir !== undefined){
	//when start with environment variables
	//baseDir=/Users/sle/blt/app/main/core npm start
	console.log('Retrived baseDir from Environment Variable');
	processParser( 
		process.env.baseDir,
		config.outputDir
	);
}
else if(process.argv[2]){
	//if passed in command line via
	//node generateJsAutoComplete.js /path/to/auragit
	var baseDir;
	if (process.argv[2] === '--silent'){
		console.log('Silent mode: assumed path: '.bold.red, config.baseDir);
		baseDir = config.baseDir;
	}
	else{
		baseDir = process.argv[2];	
	}

	processParser( 
		baseDir,
		config.outputDir
	);
}
else{
	//via prompt
	prompt.start();

	prompt.get(promptSchema, function (err, result) {
		processParser(
			result.baseDir,
			config.outputDir
		);
	});
}



function processParser(baseDir, outputDir){
	//trim whitespace
	baseDir = baseDir.trim();
	outputDir = outputDir.trim();
	
	generateXmlAutoComplete(
		baseDir,//base input dir
		outputDir//base output dir , snippet
	);
	generateJsAutoComplete(
		baseDir,//base input dir
		outputDir//base output dir , snippet
	);
}
