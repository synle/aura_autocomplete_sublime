//depdencies
var path = require('path');
var fs = require('fs');
var colors = require('colors');

//internal dependencies
var parseHelper = require('./parseHelper');

//base path (parsed form command line or default to my git folder)
var baseDir = process.argv[2] || '/Users/syle/git/aura/';


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
	'aura-impl/target/classes/aura/test/Test.js'
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
	'aura-impl/target/classes/aura/util/Util.js'
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
	'./aura.sublime-completions'
);


//consolidate atom files
console.log('Updating Atom File: Util and Test JS:'.bold.magenta.underline);
parseHelper.writeToFile(
	parseHelper.consolidate_atom(masterDictionary),
	'./aura.atom.cson'
);