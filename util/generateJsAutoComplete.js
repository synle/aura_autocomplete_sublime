//depdencies
var path = require('path');
var colors = require('colors');
var _ = require('lodash');
var jsdom = require('jsdom');
var Q = require('q');

//internal dependencies
var parseHelper = require('./parseHelper');
var logger = require('./logger');//internal logger


//componentFileNames: dictionary containing all js, evt and cmp files
//outputDir: where to store the snippet
module.exports = function processParser(componentFileNames, outputDir){
	logger.log('    Parsing Aura JS Files    '.rainbow.cyan.underline.bgBlack);

	//searching through for the files
	var testJsPath;
	var utilJsPath;

	//master dictionary of util methjods
	var masterDictionary = {};


	_.forEach(componentFileNames.js, function(jsFileFullPath){
		if(jsFileFullPath.indexOf('src/main/resources/aura/test/Test.js') >= 0){
			testJsPath = jsFileFullPath;
		}
		else if(jsFileFullPath.indexOf('src/main/resources/aura/util/Util.js') >= 0){
			utilJsPath = jsFileFullPath;
		}
	});


	//needs to be defined
	if (testJsPath === undefined || utilJsPath === undefined){
		logger.error('Error! testJsPath or utilJsPath is undefined');
		logger.error('testJsPath', testJsPath);
		logger.error('utilJsPath', utilJsPath);
		return;
	}



	//properly mocking up required variables
	jsdom.env({
	  html: "<html><body></body></html>",
	  done: function(errs, incomingWindow) {
			//init Aura global obejct
			var Aura = {
				Utils: {
					Util : {},
					SecureFilters : {
						html: ''
					}
				}
			};

			var $A = {
				installOverride: function(){},
				logger:{
					subscribe:function(){}
				}
			};

			var Component = AuraLayoutService = function(){};

			//needs to be injected via code
	    	var window = incomingWindow;
			var navigator = incomingWindow.navigator;


			//start parsing
			//generarte path for the test and util js file
			//read content files
			Q.all([parseHelper.readFromFileAsync(
				testJsPath,
				true//silent
			), parseHelper.readFromFileAsync(
				utilJsPath,
				true//silent
			)]).then(function(fileContents){
				var fileContentAuraTest = fileContents[0];
				var fileContentAuraUtil = fileContents[1];
				
				//AURA TEST JS FILE
				//parse test js
				eval(fileContentAuraTest);
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
				//parse test js
				eval(fileContentAuraUtil);
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
			});
	  }
	});
}
