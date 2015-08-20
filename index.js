//depdencies
var path = require('path');
var fs = require('fs');
var colors = require('colors');
var prompt = require('prompt');
var parseString = require('xml2js').parseString;

//internal dependencies
var parseHelper = require('./util/parseHelper');
var logger = require('./util/logger');//internal logger
var config = require('./config');
var promptSchema = config.prompt;


//internal dependencies
var generateXmlAutoComplete = require('./util/generateXmlAutoComplete');
var generateJsAutoComplete = require('./util/generateJsAutoComplete');

//setting debug=2 will trigger full logging mode
if (process.env.baseDir !== undefined){
	//when start with environment variables
	//debug=2 baseDir=/Users/sle/blt/app/main/core npm start
	logger.debug('Retrived baseDir from Environment Variable');
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
		logger.debug('Silent mode: assumed path: '.bold.red, config.baseDir);
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
	logger.log(baseDir.bold.underline, baseDir);

	//trim whitespace
	baseDir = baseDir.trim();
	outputDir = outputDir.trim();


	//get a list of all files
	//read content files
	var componentBaseDir = path.join(
		baseDir,
		'/'
	);

	//find all cmp files in nested structures
	var componentFileNames = parseHelper.listDir(componentBaseDir);


	//print stats
	logger.log('Statistics'.bold.underline.bgBlue.white);
	logger.log('.app Files:'.bold, componentFileNames.app.length);
	logger.log('.cmp Files:'.bold, componentFileNames.cmp.length);
	logger.log('.evt Files:'.bold, componentFileNames.evt.length);
	// logger.log('js Files:'.bold, componentFileNames.js.length);
	logger.log('\tHelper.js Files:'.bold, componentFileNames.helperjs.length);
	logger.log('\tController.js Files:'.bold, componentFileNames.controllerjs.length);
	logger.log('\tRenderrer.js Files:'.bold, componentFileNames.rendererjs.length);

		
	generateXmlAutoComplete(
		componentFileNames,//dictionary containing all js, evt and cmp files
		outputDir//base output dir , snippet
	);

	try{
		generateJsAutoComplete(
			componentFileNames,//dictionary containing all js, evt and cmp files
			outputDir//base output dir , snippet
		);	
	}
	catch(ex){
		logger.error('Issue trying to parse JS files', ex);
	}
}
