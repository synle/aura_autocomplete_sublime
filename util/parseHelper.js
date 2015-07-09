//depdencies
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

//internal
var consolidatorAtom = require('./serializer/serializerAtomHelper');
var consolidatorSublime =  require('./serializer/serializerSublimeHelper');
var logger = require('./logger');//internal logger

//definitions
var self = {
    readFromFile: function(path, silent) {
        logger.debug('Reading file...'.magenta.bold);
        logger.debug(path.yellow);
        return fs.readFileSync(path, 'utf-8');
    },
    listDir: function listDir(dir, res) {
        res = res || {
            cmp: [],
            evt: [],
            helperjs: [],
            js: []
        };
        var dirs = fs.readdirSync(dir);
        for (var i = 0; i < dirs.length; i++) {
            var newDir = path.join(dir, dirs[i]);
            if (fs.lstatSync(newDir).isDirectory()) {
                listDir(newDir, res);
            } else {
                //is a file
                var extension = path.extname(newDir);


                //ignore auradev auradoc
                // if (newDir.indexOf('auradoc') >= 0
                // || newDir.indexOf('auradev') >= 0
                // || newDir.indexOf('aurajstest') >= 0){
                //     continue;
                // }

                switch (extension) {
                    case '.cmp':
                        res.cmp.push(newDir);
                        break;
                    case '.evt':
                        res.evt.push(newDir);
                        break;
                    case '.js':
                        res.js.push(newDir);

                        //special helper js
                        if(newDir.indexOf('Helper.js') >= 0){
                            res.helperjs.push(newDir);    
                        }
                        break;
                }
            }
        }

        return res;
    },
    getParamsFromFuncDef: function(funcDefStr){
        var paramsStr = funcDefStr.match(/\(.*\)/)[0]; // match the first (...)
        paramsStr = paramsStr.substr(1, paramsStr.length - 2); //remove ( and )
        return paramsStr;
    },
    getParamsArrayFromStr: function(paramsStr){
        var params; //params array
        if (paramsStr.indexOf('*') === -1) {
            //no closure comment, do it this way (array)
            //convert params string to array
            params = paramsStr.split(', ');

            //shorten and trim bad character
            for (var i = 0; i < params.length; i++) {
                params[i] = '${' + (i + 1)  + ':' + self.shortenName(params[i]) + '}';
            }
        } else {
            //dont do anything when /**/ found
            params = [paramsStr];

            //shorten and trim bad character
            for (var i = 0; i < params.length; i++) {
                params[i] = '$' + (i + 1) + self.shortenName(params[i]);
            }
        }

        return params;
    },
    parseFunctions: function(functionName, functionDefition, namespaceStr) {
        if (typeof functionDefition === 'function') {
            //get function definitions as string
            var funcDefStr = functionDefition.toString();
            //parse the params
            var paramsStr = self.getParamsFromFuncDef(funcDefStr);
            // console.log(functionName.blue, paramsStr)
            var params = self.getParamsArrayFromStr(paramsStr);

            //pure params
            var pureParams = paramsStr;

            //output
            // console.log((namespaceStr + functionName).green.bold.underline + ':\t');
            // console.log(params.join('\n').cyan);
            return [namespaceStr + functionName, params, pureParams];
        } else {
            return [];
        }
    },
    shortenName: function(str) {
        //remove closure code comment and trim
        // str = str.replace(/[|]|-|\s/g, '').replace(/\/.*\//g, '');
        str = str.trim();
        //selectively return shorter name
        return str;
    },
    updateJs:function(dictionary, outputDir){
        logger.debug('Updating JS File: Util and Test JS:'.bold.magenta.underline);

        //consolidate sublime text format
        var snippetData = consolidatorSublime.consolidate_js(dictionary);
        logger.info('updateJs.sublime'.bold, snippetData.completions.length);
        self.writeToFile(
            JSON.stringify(snippetData, null, 2),
            path.join(
                outputDir,
                'aura.js.sublime-completions'
            )
        );


        //consolidate atom files
        var snippetData = consolidatorAtom.consolidate_js(dictionary);
        self.writeToFile(
            JSON.stringify(snippetData, null, 2),
            path.join(
                outputDir,
                'aura.js.atom.cson'
            )
        );
    },
    updateHelper: function(helperDictionary, outputDir){
        logger.debug('Updating JS File: Component Helper JS:'.bold.magenta.underline);

        //consolidate sublime text format
        var snippetData = consolidatorSublime.consolidate_helperjs(helperDictionary);
        logger.info('updateHelper.sublime'.bold, snippetData.completions.length);
        self.writeToFile(
            JSON.stringify(snippetData, null, 2),
            path.join(
                outputDir,
                'aura.helper.js.sublime-completions'
            )
        );


        //consolidate atom files
        var snippetData = consolidatorAtom.consolidate_helperjs(helperDictionary);
        self.writeToFile(
            JSON.stringify(snippetData, null, 2),
            path.join(
                outputDir,
                'aura.helper.js.atom.cson'
            )
        );
    },
    updateEvt: function(arrayEvents, outputDir){
        logger.debug('Updating Sublime File: Component Events'.bold.magenta.underline);

        //consolidate js evt
        var snippetData = consolidatorSublime.consolidate_evt(arrayEvents);
        logger.info('updateEvt.sublime'.bold, snippetData.completions.length);
        self.writeToFile(
            JSON.stringify(snippetData, null, 2),
            path.join(
                outputDir,
                'aura.event.js.sublime-completions'
            )
        );


        //consolidate js evt
        var snippetData = consolidatorAtom.consolidate_evt(arrayEvents);
        self.writeToFile(
            JSON.stringify(snippetData, null, 2),
            path.join(
                outputDir,
                'aura.event.js.atom.cson'
            )
        );
    },
    updateTag: function(arrayComponents, outputDir){
        logger.debug('Updating Sublime File: Component UI Tags'.bold.magenta.underline);

        //consolidate component tags
        var snippetData = consolidatorSublime.consolidate_uitags(arrayComponents);
        logger.info('updateTag.sublime'.bold, snippetData.completions.length);
        self.writeToFile(
            JSON.stringify(snippetData, null, 2),
            path.join(
                outputDir,
                'aura.uitags.sublime-completions'
            )
        );


        //consolidate js evt
        var snippetData = consolidatorAtom.consolidate_uitags(arrayComponents);
        self.writeToFile(
            JSON.stringify(snippetData, null, 2),
            path.join(
                outputDir,
                'aura.uitags.atom.cson'
            )
        );
    },
    updateTagAttr: function(arrayAttributes, outputDir){
        //consolidate component attribute
        logger.debug('Updating Sublime File: Component Attributes'.bold.magenta.underline);
        var snippetData = consolidatorSublime.consolidate_attributes(arrayAttributes);
        logger.info('updateTagAttr'.bold.sublime, snippetData.completions.length);
        self.writeToFile(
            JSON.stringify(snippetData, null, 2),
            path.join(
                outputDir,
                'aura.attributes.sublime-completions'
            )
        );


        //consolidate js evt
        logger.debug('Updating Sublime File: Component Attributes'.bold.magenta.underline);
        var snippetData = consolidatorAtom.consolidate_attributes(arrayAttributes);
        self.writeToFile(
            JSON.stringify(snippetData, null, 2),
            path.join(
                outputDir,
                'aura.attributes.atom.cson'
            )
        );
    },
    _getDefaultSublimeJSObject: function(incomingScope) {
        return {
            "scope": incomingScope || "source",
            "completions": []
        };
    },
    writeToFile: function(string, path) {
        logger.debug(path.yellow);
        fs.writeFileSync(path, string);
    },
    getBaseFileNameWithoutExtension: function(fileName){
        var shortFileName = path.basename(fileName);
        return shortFileName.substr(0, shortFileName.indexOf('.'));
    },
    getComponentBreakup: function(fileName){
        var splits = fileName.split('/');
        return [splits[splits.length - 3], splits[splits.length - 2]];
    }
};
module.exports = self;