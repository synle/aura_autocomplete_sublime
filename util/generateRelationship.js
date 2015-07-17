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
        mappings[getFormattedName('app', namespace, componentName)] = {};
    });
    _.forEach(componentFileNames.cmp, function(fileName, idx) {
        var fileBreakups = parseHelper.getComponentBreakup(fileName);
        var namespace = fileBreakups[0];
        var componentName = fileBreakups[1];
        mappings[getFormattedName('cmp', namespace, componentName)] = {};
    });
    _.forEach(componentFileNames.evt, function(fileName, idx) {
        var fileBreakups = parseHelper.getComponentBreakup(fileName);
        var namespace = fileBreakups[0];
        var componentName = fileBreakups[1];
        mappings[getFormattedName('evt', namespace, componentName)] = {};
    });
    var max = 10;//temporary return point
    //look at the files and find hints connecting the component
    componentFileNames.app.forEach(function(fileName) {
        var fileContent = parseHelper.readFromFile(fileName, true);
        var fileBreakups = parseHelper.getComponentBreakup(fileName);
        var namespace = fileBreakups[0];
        var componentName = fileBreakups[1];
        //look for all components that used here
        parseComponentsUsed('app', fileName, namespace, componentName, fileContent);
        max--;
        if (max === 0) {
            process.exit();
        }
    });
    componentFileNames.cmp.forEach(function(fileName) {
        var fileContent = parseHelper.readFromFile(fileName, true);
        //look for all components that used here
    });

    function parseComponentsUsed(type, fileName, namespace, componentName, fileContent) {
        console.log(namespace, componentName)
        parseString(fileContent, {
            async: true
        }, function(err, result) {
            parseRecursiveComponent(result);
        });
    }

    function parseRecursiveComponent(obj) {
        //should we directly change the mappings
    }

    function getFormattedName(type, namespace, componentName) {
        return type + '.' + namespace + '.' + componentName;
    }
};