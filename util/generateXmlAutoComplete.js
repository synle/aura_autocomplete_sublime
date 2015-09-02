//depdencies
var cheerio = require('cheerio')
var path = require('path');
var colors = require('colors');
var parseString = require('xml2js').parseString;
var _ = require('lodash');

//internal dependencies
var parseHelper = require('./parseHelper');
var logger = require('./logger');//internal logger

var BLACK_LIST_NAMESPACE = {
	auraTest : 1,
	test : 1,
	uitest : 1
}


function isValidNamespace(namespace){
	if(BLACK_LIST_NAMESPACE[namespace] !== undefined){
		//black listed namespace, will be ignored
		return false;
	}

	return true;
}


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
		var evtType = '';
		var evtParams = [];
		var fileContent = parseHelper.readFromFile(
			fileName,
			true
		);


		//get file breakup which allows us to generate a more accurate component name
		var fileBreakups = parseHelper.getComponentBreakup(fileName);
		var evtNameKey = fileBreakups[0] + ':' + fileBreakups[1];


		//parsing xml
		$ = cheerio.load(
			fileContent,
			{ xmlMode: true }
		);

		evtDescription = $('aura\\:event').attr('description') || evtDescription;
		evtType = $('aura\\:event').attr('type') || evtType;

		//save it to the dictionary
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
				type: evtType,
				fileName : fileName
			};
		}

		//push attributes
		var parsedAttributes = $('aura\\:attribute');
		_.forEach(parsedAttributes, function(curEvtAttr){
			evtParams.push({
				name: curEvtAttr.attribs.name,
				type: curEvtAttr.attribs.type,
				description: curEvtAttr.attribs.description
			});
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

		if(isValidNamespace(namespace) === false){
			//black listed namespace, will be ignored
			return;
		}


		//parsing xml
		$ = cheerio.load( fileContent );

		//parsing componet stuffs
		var parsedComponent = $('aura\\:component')[0];
		if(parsedComponent === undefined){
			logger.info('Error! cannot find aura:component tag in'.bold.red, fileName);
			return;//exit
		}
		// console.log('parsed'.red, parsedComponent);
		componentObj.description = parsedComponent.attribs.description || '';
		componentObj.implements  = parsedComponent.attribs.implements || '';


		//parsing attribtues
		//populate the component itself
		var componentAuraAttributes = $('aura\\:attribute');
		_.forEach(componentAuraAttributes, function(curAttribute){
			var attributeObj = curAttribute.attribs;

			arrayAttributes.push({
				component: componentObj,
				attribute: attributeObj
			});

			attributeObj.TAG = 'attribute';


			componentObj.attributes.push(attributeObj);
		});


		//aura events
		var componentAuraEvents = $('aura\\:registerevent');
		_.forEach(componentAuraEvents, function(curCmpEvt){
			var evtObj = curCmpEvt.attribs;
			var matchingEvtDef = eventDictionary[evtObj.type];

			evtObj.TAG = 'event';

			if (matchingEvtDef === undefined){
				logger.error('Error! cant find in dictionary'.bold.red,evtObj.type);
				return;
			}

			//some events are treated as attribute
			arrayAttributes.push({
				component: componentObj,
				attribute: evtObj
			});


			//push event
			arrayEvents.push({
				namespace: namespace,
				component : componentName,
				evt : evtObj,
				evtDef : matchingEvtDef
			});


			componentObj.attributes.push(evtObj);
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


		if(isValidNamespace(namespace) === false){
			//black listed namespace, will be ignored
			return;
		}

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
