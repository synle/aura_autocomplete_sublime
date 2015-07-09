//depdencies
var path = require('path');
var colors = require('colors');
var parseString = require('xml2js').parseString;
var _ = require('lodash');

//internal dependencies
var parseHelper = require('./parseHelper');
var logger = require('./logger');//internal logger


//componentFileNames: dictionary containing all js, evt and cmp files
//outputDir: where to store the snippet
module.exports = function processParser(componentFileNames, outputDir){
	logger.log('   Parsing Aura XML Files   '.rainbow.cyan.underline.bgBlack);

	// global dictionary
	var eventDictionary = {};//being used only as a quick look up
	var arrayComponents = [];
	var arrayEvents = [];
	var arrayAttributes = [];
	var helperDictionary = {};

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
				logger.error('Error!'.bold.red, evtName.yellow, ' is a duplicate');
				logger.error('\tNewfile:'.underline.bold.red, fileName);
				logger.error('\tExisted:'.underline.bold.red, eventDictionary[evtNameKey].fileName );
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
		var fileContent = parseHelper.readFromFile(
			fileName,
			true
		);


		var fileBreakups = parseHelper.getComponentBreakup(fileName);
		var namespace = fileBreakups[0];
		var componentName = fileBreakups[1];

		var componentObj = {
			name : componentName,
			description : '',
			// attributes : [],
			namespace : namespace,
			fullComponentTag: namespace + ':' + componentName,
			implements : '',
			attributes : []
		}


		//parsing xml
		parseString(fileContent, {async: true}, function (err, result) {
			if (result === undefined || result === null || result['aura:component'] === undefined){
				return;
			}

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
						logger.error('Error! cant find in dictionary'.bold.red,evtObj.type, matchingEvtDef);
						return;	
					}
					

					arrayEvents.push({
						namespace: namespace,
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


					componentObj.attributes.push(attributeObj);
				});
			}
		});

		arrayComponents.push(componentObj);
	});
	

	
	//look up the helper
	componentFileNames.helperjs.forEach(function(fileName){
		var fileBreakups = parseHelper.getComponentBreakup(fileName);
		var namespace = fileBreakups[0];
		var componentName = fileBreakups[1];
		var fullCompName = namespace + ':' + componentName;
		var componentHelpers = [];

		var fileContent = parseHelper.readFromFile(
			fileName,
			true
		);

		//save it to helper dictionary
		helperDictionary[fullCompName] = {
			namespace : namespace,
			componentName : componentName,
			fullCompName : fullCompName,
			helpers: componentHelpers
		}



		//attached custom js for parser
		//try parse
		try{
			var METHOD_PLACEHOLDER = {};
			fileContent = fileContent.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, '$1');
			fileContent = fileContent.substr(fileContent.indexOf('('));
			fileContent = [
				'(function MAGIC_PARSER(dummyObj){',
				'METHOD_PLACEHOLDER = dummyObj;',
				'})'
			].join('\n')  + fileContent;

			// console.log('fileName'.blue, fileName)
			eval(fileContent);

			for(var methodName in METHOD_PLACEHOLDER){
				var methodDef = METHOD_PLACEHOLDER[methodName];
				if (typeof methodDef === 'function'){
					var methodDefStr = methodDef.toString();
					var paramsStr = parseHelper.getParamsFromFuncDef(methodDefStr);
					var params = parseHelper.getParamsArrayFromStr(paramsStr);

					var parsedStuffs = parseHelper.parseFunctions(methodName, methodDef, fullCompName)

					componentHelpers.push({
						functionName : methodName,
						annotatedValue: parsedStuffs[1],
						origValue : parsedStuffs[2]
					});
				}
			}
		}
		catch(e){
			logger.error('Error! Problem processing the file'.bold.underline.red , fileName.blue , e.toString());
		}
	})


	//consolidate events
	//consolidate component attribute
	//consolidate component tags
	parseHelper.updateEvt(arrayEvents, outputDir);
	parseHelper.updateTag(arrayComponents, outputDir);
	parseHelper.updateTagAttr(arrayAttributes, outputDir);
	parseHelper.updateHelper(helperDictionary, outputDir);



}