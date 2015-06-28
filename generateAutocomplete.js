//depdencies
var path = require('path');
var fs = require('fs');
var colors = require('colors');


//base path
var baseDir = '/Users/syle/git/aura/';


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
}


//AURA TEST JS FILE
//generarte path for the test and util js file
var testJsPath = path.join(
	baseDir,
	'aura-impl/target/classes/aura/test/Test.js'
);

//output testjs
console.log('Parsing testUtil file'.yellow.bold);
console.log(testJsPath.yellow);

//read content files
var fileContent = fs.readFileSync(testJsPath, 'utf-8');


//parse test js
eval(fileContent);
var strNamespace = '$A.test'
var curNamespace = $A.test;
for (var k in curNamespace){
	
	if(typeof curNamespace[k] === 'function'){
		//get function definitions as string
		var funcDef = curNamespace[k].toString();
		

		//parse the params
		var params = funcDef.match(/\(.*\)/)[0]; // match the first (...)
		params = params.substr(1, params.length - 2); //remove ( and )

		console.log(strNamespace.red.bold + k.red.bold);
		console.log(params.blue);
	}
}



//AURA UTILS JS FILE
var utilJsPath = path.join(
	baseDir,
	'aura-impl/target/classes/aura/util/Util.js'
);


//output testjs
console.log('Parsing testUtil file'.yellow.bold);
console.log(utilJsPath.yellow);


//read content files
var fileContent = fs.readFileSync(utilJsPath, 'utf-8');


//parse test js
eval(fileContent);
var strNamespace = 'Aura.Utils.Util';
var curNamespace = Aura.Utils.Util;
for (var k in curNamespace){
	if(typeof curNamespace[k] === 'function'){
		//get function definitions as string
		var funcDef = curNamespace[k].toString();
		
		//parse the params
		var params = funcDef.match(/\(.*\)/)[0]; // match the first (...)
		params = params.substr(1, params.length - 2); //remove ( and )

		console.log(strNamespace.red.bold + k.red.bold);
		console.log(params.blue);
	}
}