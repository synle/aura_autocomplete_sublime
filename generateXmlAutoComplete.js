//depdencies
var path = require('path');
var fs = require('fs');
var colors = require('colors');
var parseString = require('xml2js').parseString;


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




//events stuffs
//generate events stuffs
var eventDictionary = {};
componentFileNames.evt.forEach(function(fileName){
	if(fileName.indexOf('updateGridRow.evt') >= 0){
		var shortFileName = path.basename(fileName);
		var evtName = shortFileName.substr(0, shortFileName.indexOf('.'));
		var evtDescription = '';
		var evtParams = [];

		// console.log('evt'.bold.blue, fileName.yellow);
		var fileContent = parseHelper.readFromFile(fileName);	


		//parsing xml
		parseString(fileContent, function (err, result) {
			evtDescription = result['aura:event'].$.description;

			result['aura:event']['aura:attribute'].forEach(function(auraAttribute){
				var evtAttribute = auraAttribute.$;
				evtParams.push(evtAttribute);
			});


			//save it to the dictionary
			eventDictionary[shortFileName] = {
				name: evtName,
				description: evtDescription,
				params : evtParams
			};
		});
	}
});


console.log(eventDictionary);


// /Users/syle/git/aura/aura-components/src/main/components/ui/updateGridRow/updateGridRow.evt


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