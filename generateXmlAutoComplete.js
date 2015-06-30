//depdencies
var path = require('path');
var fs = require('fs');
var colors = require('colors');
var prompt = require('prompt');
var parseString = require('xml2js').parseString;

//internal dependencies
var parseHelper = require('./util/parseHelper');
var config = require('./config');
var promptSchema = config.prompt;



console.log('   Parsing Aura XML Files   '.rainbow.cyan.underline.bgBlack);

if(process.argv[2]){
	//if passed in command line via
	//node generateJsAutoComplete.js /path/to/auragit
	var baseDir;
	if (process.argv[2] === '--silent'){
		console.log('Silent mode'.red);
		baseDir = config.baseDir;
	}
	else{
		baseDir = process.argv[2];	
	}

	processParser( 
		baseDir,
		config.outputDir
	);
}
else{
	//via prompt
	prompt.start();

	prompt.get(promptSchema, function (err, result) {
		processParser (
			result.baseDir,
			config.outputDir
		);
	});
}


//base path (parsed form command line or default to my git folder)
//outputDir where to store the snippet
function processParser(baseDir, outputDir){
	//read content files
	var componentBaseDir = path.join(
		baseDir,
		'/aura-components/src/main/components'
	);


	// global dictionary
	var eventDictionary = {};//being used only as a quick look up
	var arrayComponents = [];
	var arrayEvents = [];
	var arrayAttributes = [];

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


		//get file breakup which allows us to generate a more accurate component name
		var fileBreakups = parseHelper.getComponentBreakup(fileName);


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
			var evtNameKey = fileBreakups[0] + ':' + fileBreakups[1];
			if(eventDictionary[evtNameKey]){
				console.log('Error'.bold.red, evtName.yellow, ' is a duplicate');
				console.log('newfile'.bold.red, fileName.blue);
				console.log('existed'.bold.red, eventDictionary[evtName].fileName.blue);
			}
			else{
				eventDictionary[evtNameKey] = {
					name: evtName,
					description: evtDescription,
					params : evtParams,
					fileName : fileName
				};
			}
			// console.log('EventDef', evtNameKey.bold.blue);
		});
	});


	//reading and parsing the componentEvents
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
			var componentParsedObj = componentParsedXml.$ || {};

			componentObj.description = componentParsedObj.description || '';
			componentObj.implements = componentParsedObj.implements || '';

			//push component events
			var componentAuraEvents = componentParsedXml['aura:registerevent'];
			if(componentAuraEvents){
				componentAuraEvents.forEach(function(curCmpEvt){
					var evtObj = curCmpEvt.$;
					var matchingEvtDef = eventDictionary[evtObj.type];

					// console.log('component used'.red, evtObj.type);

					if (matchingEvtDef === undefined){
						console.log('Error : cant find in dictionary'.bold.red,evtObj.type);
						console.log(matchingEvtDef);
						return;	
					}
					

					arrayEvents.push({
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

					arrayAttributes.push({
						component: componentObj,
						attribute: attributeObj
					});
				});
			}
		});

		arrayComponents.push(componentObj);
	});



	//consolidate events
	//consolidate component attribute
	//consolidate component tags
	parseHelper.updateEvt(arrayEvents, outputDir);
	parseHelper.updateTag(arrayComponents, outputDir);
	parseHelper.updateTagAttr(arrayAttributes, outputDir);
}