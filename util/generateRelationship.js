//depdencies
var path = require('path');
var colors = require('colors');
var parseString = require('xml2js').parseString;
var _ = require('lodash');
//internal dependencies
var parseHelper = require('./parseHelper');
var logger = require('./logger'); //internal logger
//componentFileNames: dictionary containing all js, evt and cmp files
//outputDir: where to store the snippet
module.exports = function processParser(componentFileNames, outputDir) {
    logger.log('   Parsing Relationship   '.rainbow.cyan.underline.bgBlack);
    var mappings = {}; //from, to
    _.forEach(componentFileNames.app, function(fileName, idx) {
        var fileBreakups = parseHelper.getComponentBreakup(fileName);
        var namespace = fileBreakups[0];
        var componentName = fileBreakups[1];
        
        var myFormattedName = getFormattedName('app', namespace, componentName);
        // if(myFormattedName !== 'cmp.ui.datePicker'){
        // 	return;
        // }
        mappings[myFormattedName] = {};
    });
    _.forEach(componentFileNames.cmp, function(fileName, idx) {
        var fileBreakups = parseHelper.getComponentBreakup(fileName);
        var namespace = fileBreakups[0];
        var componentName = fileBreakups[1];

        var myFormattedName = getFormattedName('cmp', namespace, componentName);
        // if(myFormattedName !== 'cmp.ui.datePicker'){
        // 	return;
        // }
        mappings[myFormattedName] = {};
    });
    // _.forEach(componentFileNames.evt, function(fileName, idx) {
    //     var fileBreakups = parseHelper.getComponentBreakup(fileName);
    //     var namespace = fileBreakups[0];
    //     var componentName = fileBreakups[1];
    //     mappings[getFormattedName('evt', namespace, componentName)] = {};
    // });

    //look at the files and find hints connecting the component
    componentFileNames.app.forEach(function(fileName) {
        var fileContent = parseHelper.readFromFile(fileName, true);
        var fileBreakups = parseHelper.getComponentBreakup(fileName);
        var namespace = fileBreakups[0];
        var componentName = fileBreakups[1];
        
        //look for all components that used here
        parseComponentsUsed('app', fileName, namespace, componentName, fileContent);
    });
    componentFileNames.cmp.forEach(function(fileName) {
        var fileContent = parseHelper.readFromFile(fileName, true);
        var fileBreakups = parseHelper.getComponentBreakup(fileName);
        var namespace = fileBreakups[0];
        var componentName = fileBreakups[1];
        
        //look for all components that used here
        parseComponentsUsed('cmp', fileName, namespace, componentName, fileContent);
    });


    logger.info(mappings)


    //helpers
    function parseComponentsUsed(type, fileName, namespace, componentName, fileContent) {
        logger.debug(type.red.bold, namespace.red.bold, componentName.red.bold, fileName)
        parseString(fileContent, {
            async: true
        }, function(err, result) {
            parseRecursiveComponent(type, namespace, componentName, result);
        });
    }

    function parseRecursiveComponent(type, namespace, componentName, obj) {
    	var myFormattedName = getFormattedName(type, namespace, componentName);
    	// logger.log(myFormattedName.red, obj);

        //should we directly change the mappings
        for (var k in obj){
        	if (k.indexOf(':') >= 0){
        		//hooks it up
	        	var curChildFormattedName = getFormattedNameFromString(k);

	        	//increase count
	        	if (_.isArray(obj[k])){
	        		mappings[myFormattedName][curChildFormattedName] = obj[k].length;
	        	}
        		else{
        			//parse further
	        		mappings[myFormattedName][curChildFormattedName] = 1;
        			parseRecursiveComponent(type, namespace, componentName, obj[k])
        		}
        	}
        }
    }

    function getFormattedName(type, namespace, componentName) {
        return type + '.' + namespace + '.' + componentName;
    }

    function getFormattedNameFromString(str){
    	var splits = str.split(':');
    	return 'cmp.' + splits[0] + '.' + splits[1];
    }
};