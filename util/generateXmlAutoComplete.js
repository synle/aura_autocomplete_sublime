//depdencies
var cheerio = require('cheerio');
var path = require('path');
var colors = require('colors');
var parseString = require('xml2js').parseString;
var _ = require('lodash');
var Q = require('q');
//internal dependencies
var parseHelper = require('./parseHelper');
var logger = require('./logger'); //internal logger
var config = require('../config');

function isValidNamespace(namespace) {
    if (config.BLACK_LIST_NAMESPACE[namespace] !== undefined) {
        //black listed namespace, will be ignored
        return false;
    }
    return true;
}

function isValidComponent(fullCompName){
    if (config.BLACK_LIST_COMPONENTS[fullCompName] !== undefined) {
        //black listed namespace, will be ignored
        return false;
    }
    return true;
}

function isAccessEligibleForExpose(propAccess){
    propAccess = propAccess || '';
    return propAccess.toUpperCase() !== 'PRIVATE';
}

//componentFileNames: dictionary containing all js, evt and cmp files
//outputDir: where to store the snippet
module.exports = function processParser(componentFileNames, outputDir) {
    logger.log('   Parsing Aura XML Files   '.rainbow.cyan.underline.bgBlack);
    var promise = {
        evt: [],
        all: []
    };
    // global dictionary
    var eventDictionary = {}; //being used only as a quick look up
    var arrayComponents = [];
    var arrayEvents = [];
    var arrayAttributes = [];
    var helperDictionary = {};


    var errorHash = {};


    //events stuffs
    //reading and parsing the events
    componentFileNames.evt.forEach(function(fileName) {
        var evtName = parseHelper.getBaseFileNameWithoutExtension(fileName);
        var evtDescription = '';
        var evtType = '';
        var evtParams = [];
        //get file breakup which allows us to generate a more accurate component name
        var fileBreakups = parseHelper.getComponentBreakup(fileName);
        var evtNameKey = fileBreakups[0] + ':' + fileBreakups[1];

		//define and append promise
        var defer = Q.defer();
        promise.evt.push(defer.promise);
        promise.all.push(defer.promise);

        parseHelper.readFromFileAsync(fileName, true).then(function(fileContent) {
            //success
            //parsing xml
            $ = cheerio.load(fileContent, {
                xmlMode: true
            });
            evtDescription = $('aura\\:event').attr('description') || evtDescription;
            evtType = $('aura\\:event').attr('type') || evtType;
            //save it to the dictionary
            if (eventDictionary[evtNameKey]) {
                logger.error('Error!'.bold.red, evtName.yellow, ' is a duplicate');
                logger.error('\tNewfile:'.underline.bold.red, fileName);
                logger.error('\tExisted:'.underline.bold.red, eventDictionary[evtNameKey].fileName);
            } else {
                eventDictionary[evtNameKey] = {
                    name: evtName,
                    description: evtDescription,
                    params: evtParams,
                    type: evtType,
                    fileName: fileName
                };
            }
            //push attributes
            var parsedAttributes = $('aura\\:attribute');
            _.forEach(parsedAttributes, function(curEvtAttr) {
                evtParams.push({
                    name: curEvtAttr.attribs.name,
                    type: curEvtAttr.attribs.type,
                    description: curEvtAttr.attribs.description
                });
            });
            defer.resolve('success');
        }, function(){
        	defer.reject('evt failed');
        });
    }, function(ex){
    	logger.error('componentFileNames.evt failed:'.red + '\t' + ex);
    });




    //wait till promise is done
    Q.all(promise.evt).then(function() {
    	logger.log('promise.evt done'.yellow.bold);

        //success
        //reading and parsing the componentEvents
        componentFileNames.cmp.forEach(function(fileName) {
            var fileBreakups = parseHelper.getComponentBreakup(fileName);
            var namespace = fileBreakups[0];
            var componentName = fileBreakups[1];

            //setup and install promise
            var defer = Q.defer();
            promise.all.push(defer.promise);

            parseHelper.readFromFileAsync(fileName, true).then(function(fileContent) {
                //success
                var componentObj = {
                    name: componentName,
                    description: '',
                    // attributes : [],
                    namespace: namespace,
                    fullComponentTag: namespace + ':' + componentName,
                    implements: '',
                    attributes: []
                };

                //early exit if it is invalid namespace
                if (isValidNamespace(namespace) === false) {
                    //black listed namespace, will be ignored
                    return defer.resolve('black list');
                }
                else{
                    //parsing xml
                    $ = cheerio.load(fileContent);
                    //parsing componet stuffs
                    var parsedComponent = $('aura\\:component')[0];
                    if (parsedComponent === undefined) {
                        return; //exit
                    }
                    // console.log('parsed'.red, parsedComponent);
                    componentObj.description = parsedComponent.attribs.description || '';
                    componentObj.implements = parsedComponent.attribs.implements || '';
                    //parsing attribtues
                    //populate the component itself
                    var componentAuraAttributes = $('aura\\:attribute');
                    _.forEach(componentAuraAttributes, function(curAttribute) {
                        var attributeObj = curAttribute.attribs;

                        // respect access (private attributes are not going to be exposed...)
                        if(isAccessEligibleForExpose(attributeObj.access)){
                            arrayAttributes.push({
                                component: componentObj,
                                attribute: attributeObj
                            });
                            attributeObj.TAG = 'attribute';
                            componentObj.attributes.push(attributeObj);
                        } else {
                            defer.resolve('ignore due to private access');
                        }
                    });
                    //aura events
                    var componentAuraEvents = $('aura\\:registerevent');
                    _.forEach(componentAuraEvents, function(curCmpEvt) {
                        var evtObj = curCmpEvt.attribs;
                        var matchingEvtDef = eventDictionary[evtObj.type];
                        evtObj.TAG = 'event';

                        if(isAccessEligibleForExpose(evtObj.access)){
                            if (matchingEvtDef === undefined) {
                                errorHash[evtObj.type] = errorHash[evtObj.type] || 1;
                                errorHash[evtObj.type]++;
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
                                component: componentName,
                                evt: evtObj,
                                evtDef: matchingEvtDef
                            });
                            componentObj.attributes.push(evtObj);
                        } else {
                            defer.resolve('ignore due to private access');
                        }
                    });
                    arrayComponents.push(componentObj);
                    defer.resolve('success');
                }
            }, function(){
	        	defer.reject('cmp failed');
	        });
        }, function(ex){
	    	logger.error('componentFileNames.cmp failed:'.red + '\t' + ex);
	    });





        //look up the helper
        componentFileNames.helperjs.forEach(function(fileName) {
            var fileBreakups = parseHelper.getComponentBreakup(fileName);
            var namespace = fileBreakups[0];
            var componentName = fileBreakups[1];
            var fullCompName = namespace + ':' + componentName;
            var componentHelpers = [];


            //setup and install promise
            var defer = Q.defer();
            promise.all.push(defer.promise);


            //early exit if it is invalid namespace
            if (isValidNamespace(namespace) === false) {
                //black listed namespace, will be ignored
                return defer.resolve('black list');
            }

            parseHelper.readFromFileAsync(fileName, true).then(function(fileContent) {
                //success
                //save it to helper dictionary
                helperDictionary[fullCompName] = {
                    namespace: namespace,
                    componentName: componentName,
                    fullCompName: fullCompName,
                    helpers: componentHelpers
                };

                if(!isValidComponent(fullCompName)){
                    return defer.resolve('black list full component');
                }

                //attached custom js for parser
                //try parse
                try {
                    var METHOD_PLACEHOLDER = {};
                    fileContent = fileContent.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, '$1');
                    fileContent = fileContent.substr(fileContent.indexOf('('));
                    fileContent = ['(function MAGIC_PARSER(dummyObj){', 'METHOD_PLACEHOLDER = dummyObj;', '})'].join('\n') + fileContent;
                    // console.log('fileName'.blue, fileName)
                    eval(fileContent);

                    for (var methodName in METHOD_PLACEHOLDER) {
                        var methodDef = METHOD_PLACEHOLDER[methodName];
                        if (typeof methodDef === 'function') {
                            var methodDefStr = methodDef.toString();
                            var paramsStr = parseHelper.getParamsFromFuncDef(methodDefStr);
                            var params = parseHelper.getParamsArrayFromStr(paramsStr);
                            var parsedStuffs = parseHelper.parseFunctions(methodName, methodDef, fullCompName);
                            componentHelpers.push({
                                functionName: methodName,
                                annotatedValue: parsedStuffs[1],
                                origValue: parsedStuffs[2]
                            });
                        }
                    }
                } catch (e) {
                    logger.error('Error! Problem processing the file'.bold.underline.red, fileName.blue, e.toString());
                }
                defer.resolve('success');
            }, function(){
	        	defer.reject('helperjs failed');
	        });
        }, function(ex){
	    	logger.error('componentFileNames.helperjs failed:'.red + '\t' + ex);
	    });


        //ready to write to file
        Q.all(promise.all).then(function() {
            logger.log('promise.all done'.yellow.bold);

            //success
            var hashMissingDictionary = Object.keys(errorHash);
            if(hashMissingDictionary.length > 0){
                logger.error('Error! cannot find in dictionary\n'.bold.red, hashMissingDictionary.join(', '));
            }


            //update
            parseHelper.updateTag(arrayComponents, outputDir);
            parseHelper.updateEvt(arrayEvents, outputDir);//consolidate events
            parseHelper.updateTagAttr(arrayAttributes, outputDir);
            parseHelper.updateHelper(helperDictionary, outputDir);
        }, function(){
            logger.error('promise.all. failed:'.red + '\t' + ex);
        });

    }, function(){
    	logger.error('promise.evt failed:'.red + '\t' + ex);
    });
};
