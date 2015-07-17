//depdencies
var cheerio = require('cheerio')
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
    var mappings = {}; //has-a mapping
    var reverseMappings = {}; //uses-in mapping
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


    // logger.info('mappings'.red.bold, mappings)
    // logger.info('reverseMappings'.blue.bold, reverseMappings)
    
    
    parseHelper.writeToFile(JSON.stringify(mappings, null, 1), 		  'mappings.orig.json');
    parseHelper.writeToFile(JSON.stringify(reverseMappings, null, 1), 'mappings.reverse.json');


    //helpers
    function parseComponentsUsed(type, fileName, namespace, componentName, fileContent) {
        logger.debug(type.red.bold, namespace.red.bold, componentName.red.bold, fileName)
        
        var myFormattedName = getFormattedName(type, namespace, componentName);

        $ = cheerio.load( fileContent );
        var tags = $('*');
        _.forEach(tags, function(tag){
            var tagName = tag.tagName;
            if (tagName.indexOf(':') >= 0){
                var curChildFormattedName = getFormattedNameFromString(tagName);

                //bump the reverse tagName mappings
                reverseMappings[tagName] = reverseMappings[tagName] || 0;
                reverseMappings[tagName]++;

                //increase my own count
                mappings[myFormattedName][curChildFormattedName] = mappings[myFormattedName][curChildFormattedName] || 0;
                mappings[myFormattedName][curChildFormattedName]++;
            }
        });
    }

    function getFormattedName(type, namespace, componentName) {
        return type + '.' + namespace + '.' + componentName;
    }

    function getFormattedNameFromString(str){
    	var splits = str.split(':');
    	return 'cmp.' + splits[0] + '.' + splits[1];
    }
};