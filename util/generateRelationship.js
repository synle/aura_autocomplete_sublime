//depdencies
var cheerio = require('cheerio')
var path = require('path');
var colors = require('colors');
var _ = require('lodash');


//internal dependencies
var parseHelper = require('./parseHelper');
var logger = require('./logger'); //internal logger


//componentFileNames: dictionary containing all js, evt and cmp files
//outputDir: where to store the snippet
module.exports = function processParser(componentFileNames, outputDir) {
    logger.log('   Parsing Relationship   '.rainbow.cyan.underline.bgBlack);
    var countHash = {}; //has-a mapping
    var depHash = {};
    var reverseCountHash = {}; //uses-in mapping
    _.forEach(componentFileNames.app, function(fileName, idx) {
        var fileBreakups = parseHelper.getComponentBreakup(fileName);
        var namespace = fileBreakups[0];
        var componentName = fileBreakups[1];
        
        var myFormattedName = getFormattedName('app', namespace, componentName);
        // if(myFormattedName !== 'cmp.ui.datePicker'){
        // 	return;
        // }
        countHash[myFormattedName] = {};
        depHash[myFormattedName] = {};
    });
    _.forEach(componentFileNames.cmp, function(fileName, idx) {
        var fileBreakups = parseHelper.getComponentBreakup(fileName);
        var namespace = fileBreakups[0];
        var componentName = fileBreakups[1];

        var myFormattedName = getFormattedName('cmp', namespace, componentName);
        // if(myFormattedName !== 'cmp.ui.datePicker'){
        // 	return;
        // }
        countHash[myFormattedName] = {};
        depHash[myFormattedName] = {};
    });
    // _.forEach(componentFileNames.evt, function(fileName, idx) {
    //     var fileBreakups = parseHelper.getComponentBreakup(fileName);
    //     var namespace = fileBreakups[0];
    //     var componentName = fileBreakups[1];
    //     countHash[getFormattedName('evt', namespace, componentName)] = {};
    //     depHash[myFormattedName] = {};
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
    
        
    parseHelper.writeToFile(JSON.stringify(
        countHash, null, 1),           
        './stat/countHash.json');
    parseHelper.writeToFile(JSON.stringify(
        depHash, null, 1), 		  
        './stat/depHash.json'
    );
    parseHelper.writeToFile(JSON.stringify(
        reverseCountHash, null, 1), 
        './stat/reverseCountHash.json'
    );


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

                //bump the reverse tagName countHash
                reverseCountHash[tagName] = reverseCountHash[tagName] || 0;
                reverseCountHash[tagName]++;

                //increase my own count
                countHash[myFormattedName][curChildFormattedName] = countHash[myFormattedName][curChildFormattedName] || 0;
                countHash[myFormattedName][curChildFormattedName]++;

                //use actual count
                depHash[myFormattedName][curChildFormattedName] = depHash[myFormattedName][curChildFormattedName] || [];
                depHash[myFormattedName][curChildFormattedName].push(tag.attribs);
            }
        });
    }

    function getAttributeMap(){

    }

    function getFormattedName(type, namespace, componentName) {
        return type + '.' + namespace + ':' + componentName;
    }

    function getFormattedNameFromString(str){
        return str;
    	// var splits = str.split(':');
    	// return splits[0] + '.' + splits[1];
    }
};