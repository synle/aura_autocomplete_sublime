//depdencies
var path = require('path');
var fs = require('fs');
var colors = require('colors');
var prompt = require('prompt');

//internal dependencies
var parseHelper = require('./parseHelper');
var promptSchema = require('./prompt.schema');



//greeting
console.log('    Parsing Aura JS Files    '.rainbow.cyan.underline.bgBlack);

if(process.argv[2]){
	//if passed in command line via
	//node generateJsAutoComplete.js /path/to/auragit
	var baseDir;
	if (process.argv[2] === '--silent'){
		baseDir = promptSchema.properties.baseDir.default;
	}
	else{
		baseDir = process.argv[2];	
	}

	processParser( 
		baseDir,
		'./snippet'
	);
}
else{
	//via prompt
	prompt.start();

	prompt.get(promptSchema, function (err, result) {
		processParser (
			result.baseDir,
			'./snippet'
		);
	});
}


//base path (parsed form command line or default to my git folder)
//outputDir where to store the snippet
function processParser(baseDir, outputDir){
	//init Aura global obejct
	var Aura = {
		Utils: {
			Util : {}
		}
	};
	var AuraLayoutService = window = {};
	var $A = {
		logger:{
			subscribe:function(){}
		}
	};
	var Component = function(){};
	var navigator = {
		userAgent : ''
	};


	//master dictionary
	var masterDictionary = {};

	//AURA TEST JS FILE
	//generarte path for the test and util js file
	var testJsPath = path.join(
		baseDir,
		'/aura-impl/src/main/resources/aura/test/Test.js'
	);

	//read content files
	var fileContent = parseHelper.readFromFile(
		testJsPath,
		true//silent
	);


	//parse test js
	eval(fileContent);
	var curNamespace = $A.test;
	for (var k in $A.test){
		var parsedStuffs = parseHelper.parseFunctions(k, curNamespace[k], 'A.test.');
		if(parsedStuffs.length >0){
			var functionName = parsedStuffs[0];
			var functionParams = parsedStuffs[1];

			masterDictionary[functionName] = functionParams;
		}
	}



	//AURA UTILS JS FILE
	var utilJsPath = path.join(
		baseDir,
		'aura-impl/src/main/resources/aura/util/Util.js'
	);

	//read content files
	var fileContent = parseHelper.readFromFile(
		utilJsPath,
		true//silent
	);


	//parse test js
	eval(fileContent);
	var curNamespace = Aura.Utils.Util.prototype;
	for (var k in curNamespace){
		var parsedStuffs = parseHelper.parseFunctions(k, curNamespace[k], 'A.util.');
		if(parsedStuffs.length >0){
			var functionName = parsedStuffs[0];
			var functionParams = parsedStuffs[1];

			masterDictionary[functionName] = functionParams;
		}
	}



	//consolidate sublime text format
	console.log('Updating Sublime File: Util and Test JS:'.bold.magenta.underline);
	parseHelper.writeToFile(
		parseHelper.consolidate_sublime(masterDictionary),
		path.join(
			outputDir,
			'aura.sublime-completions'
		)
	);


	//consolidate atom files
	console.log('Updating Atom File: Util and Test JS:'.bold.magenta.underline);
	parseHelper.writeToFile(
		parseHelper.consolidate_atom(masterDictionary),
		path.join(
			outputDir,
			'aura.atom.cson'
		)
	);
}