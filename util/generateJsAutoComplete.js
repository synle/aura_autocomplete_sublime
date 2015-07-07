//depdencies
var path = require('path');
var colors = require('colors');

//internal dependencies
var parseHelper = require('./parseHelper');


//base path (parsed form command line or default to my git folder)
//outputDir where to store the snippet
module.exports = function processParser(baseDir, outputDir){
	console.log('    Parsing Aura JS Files    '.rainbow.cyan.underline.bgBlack);

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

			masterDictionary[functionName] = {
				annotatedValue: parsedStuffs[1],
				origValue : parsedStuffs[2]
			};
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

			masterDictionary[functionName] = {
				annotatedValue: parsedStuffs[1],
				origValue : parsedStuffs[2]
			};
		}
	}



	//consolidate js file
	parseHelper.updateJs(masterDictionary, outputDir);
}