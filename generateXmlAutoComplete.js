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


// global dictionary
var eventDictionary = {};
var componentDictionary = {};
var componentEventDictionary = [];

//find all cmp files in nested structures
var componentFileNames = parseHelper.listDir(componentBaseDir);

//events stuffs
//reading and parsing the events
componentFileNames.evt.forEach(function(fileName){
	var shortFileName = path.basename(fileName);
	var evtName = shortFileName.substr(0, shortFileName.indexOf('.'));
	var evtDescription = '';
	var evtParams = [];
	var fileContent = parseHelper.readFromFile(
		fileName,
		true
	);	

	//parsing xml
	parseString(fileContent, {async: true}, function (err, result) {
		evtDescription = result['aura:event'].$.description;

		if (result['aura:event']['aura:attribute']){
			result['aura:event']['aura:attribute'].forEach(function(auraAttribute){
				var evtAttribute = auraAttribute.$;
				evtParams.push(evtAttribute);
			});
		}


		//save it to the dictionary
		if(eventDictionary[evtName]){
			console.log('Error'.bold.red, evtName.yellow, ' is a duplicate');
			console.log(fileName);
			console.log(eventDictionary[evtName].fileName);
		}
		else{
			eventDictionary[evtName] = {
				name: evtName,
				description: evtDescription,
				params : evtParams,
				fileName : fileName
			};
		}
	});
});



//reading and parsing the componentEvents
componentFileNames.cmp.forEach(function(fileName){
	var shortFileName = path.basename(fileName);
	var componentName = shortFileName.substr(0, shortFileName.indexOf('.'));
	var fileContent = parseHelper.readFromFile(
		fileName,
		true
	);


	//parsing xml
	parseString(fileContent, {async: true}, function (err, result) {
		var componentParsedXml = result['aura:component'];

		//push component events
		if(componentParsedXml['aura:registerevent']){
			componentParsedXml['aura:registerevent'].forEach(function(curCmpEvt){
				var evtObj = curCmpEvt.$;
				var matchingEvtDef = eventDictionary[evtObj.type.substr(evtObj.type.indexOf(':') + 1)];

				componentEventDictionary.push({
					component : componentName,
					evt : evtObj,
					evtDef : matchingEvtDef
				});
			});
		}
	});
});


//consolidate js evt
console.log('Updating Sublime File:'.bold.magenta.underline);
parseHelper.writeToFile(
	parseHelper.consolidate_evt_sublime(componentEventDictionary),
	'./aura.event.sublime-completions'
);



