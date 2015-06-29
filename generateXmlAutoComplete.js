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
// var componentDictionary = [];
var componentEventDictionary = [];
var componentAttributesDictionary = [];

//find all cmp files in nested structures
var componentFileNames = parseHelper.listDir(componentBaseDir);

//events stuffs
//reading and parsing the events
componentFileNames.evt.forEach(function(fileName){
	var evtName = parseHelper.getBaseFileNameWithoutExtension(fileName);
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
			console.log('newfile'.bold.red, fileName.blue);
			console.log('existed'.bold.red, eventDictionary[evtName].fileName.blue);
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
componentFileNames.cmp = [componentFileNames.cmp[287]];//used this to do quick change
componentFileNames.cmp.forEach(function(fileName){
	var componentName = parseHelper.getBaseFileNameWithoutExtension(fileName);

	var fileContent = parseHelper.readFromFile(
		fileName,
		true
	);


	var fileBreakups = parseHelper.getComponentBreakup(fileName);


	var componentObj = {
		name : componentName,
		description : '',
		// attributes : [],
		namespace : fileBreakups[0],
		fullComponentTag: fileBreakups[0] + ':' + fileBreakups[1],
		implements : ''
	}


	//parsing xml
	parseString(fileContent, {async: true}, function (err, result) {
		var componentParsedXml = result['aura:component'];
		var componentParsedObj = componentParsedXml.$;

		componentObj.description = componentParsedObj.description;
		componentObj.implements = componentParsedObj.implements;

		//push component events
		var componentAuraEvents = componentParsedXml['aura:registerevent'];
		if(componentAuraEvents){
			componentAuraEvents.forEach(function(curCmpEvt){
				var evtObj = curCmpEvt.$;
				var matchingEvtDef = eventDictionary[evtObj.type.substr(evtObj.type.indexOf(':') + 1)];

				componentEventDictionary.push({
					component : componentName,
					evt : evtObj,
					evtDef : matchingEvtDef
				});
			});
		}

		//populate the component itself
		var componentAuraAttributes = componentParsedXml['aura:attribute'];
		if(componentAuraAttributes){
			componentAuraAttributes.forEach(function(curAttribute){
				var attributeObj = curAttribute.$;
				// componentObj.attributes.push(attributeObj);

				componentAttributesDictionary.push({
					component: componentObj,
					attribute: attributeObj
				});
			});
		}
	});

	// componentDictionary.push(componentObj);
});

//consolidate js evt
console.log('Updating Sublime File: Component Events'.bold.magenta.underline);
parseHelper.writeToFile(
	parseHelper.consolidate_evt_sublime(componentEventDictionary),
	'./aura.event.sublime-completions'
);


//consolidate component attribute
console.log('Updating Sublime File: Component Attributes'.bold.magenta.underline);
parseHelper.writeToFile(
	parseHelper.consolidate_attributes_sublime(componentAttributesDictionary),
	'./aura.attributes.sublime-completions'
);