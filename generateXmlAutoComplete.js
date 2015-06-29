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

//generate xml stuffs
componentFileNames.cmp.forEach(function(fileName){
	// console.log('cmp'.bold.blue, fileName.yellow);
});

// var fileContent = parseHelper.readFromFile(utilJsPath);

// /Users/syle/git/aura/aura-components/src/main/components/ui/updateGridRow/updateGridRow.evt


//generate events stuffs
componentFileNames.evt.forEach(function(fileName){
	// console.log('evt'.bold.blue, fileName.yellow);
	var fileContent = parseHelper.readFromFile(fileName);	
	console.log(fileContent);
});


// var e = cmp.find('tabset2').get("e.addTab");

//         e.setParams({tab: {
//             "title": title,
//             "closable": closable,
//             "active": active,
//             "body": [{
//                 "componentDef": { descriptor:"markup://aura:text" },
//                 "attributes": {
//                     "values": {
//                         "value": content
//                     }
//                 }
//             }],
//             }, index: -1});
//         e.fire();