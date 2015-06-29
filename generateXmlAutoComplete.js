//depdencies
var path = require('path');
var fs = require('fs');
var colors = require('colors');

//internal dependencies
var parseHelper = require('./parseHelper');

//base path (parsed form command line or default to my git folder)
var baseDir = process.argv[2] || '/Users/syle/git/aura/';



//read content files
var componentBaseDir = path.join(
	baseDir,
	'/aura-components/src/main/components'
);



//find all cmp files in nested structures
var componentFileNames = parseHelper.listDir(componentBaseDir);


componentFileNames.cmp.forEach(function(fileName){
	console.log('cmp'.bold.blue, fileName.yellow);
});

componentFileNames.evt.forEach(function(fileName){
	console.log('evt'.bold.blue, fileName.yellow);
});

// var fileContent = parseHelper.readFromFile(utilJsPath);

// /Users/syle/git/aura/aura-components/src/main/components/ui/updateGridRow/updateGridRow.evt
