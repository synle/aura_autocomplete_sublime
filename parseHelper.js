//depdencies
var fs = require('fs');
var path = require('path');

//vars
var TRIGGER_SEPARATOR = '-';

//definitions
var self = {
    readFromFile: function(path, silent) {
        if (silent !== true) {
            console.log('Reading file...'.magenta.bold);
            console.log(path.yellow);
        }
        return fs.readFileSync(path, 'utf-8');
    },
    listDir: function listDir(dir, res) {
        res = res || {
            cmp: [],
            evt: []
        };
        var dirs = fs.readdirSync(dir);
        for (var i = 0; i < dirs.length; i++) {
            var newDir = path.join(dir, dirs[i]);
            if (fs.lstatSync(newDir).isDirectory()) {
                listDir(newDir, res);
            } else {
                //is a file
                var extension = path.extname(newDir);
                switch (extension) {
                    case '.cmp':
                        res.cmp.push(newDir);
                        break;
                    case '.evt':
                        res.evt.push(newDir);
                        break;
                }
            }
        }
        return res;
    },
    parseFunctions: function(functionName, functionDefition, namespaceStr) {
        if (typeof functionDefition === 'function') {
            //get function definitions as string
            var funcDefStr = functionDefition.toString();
            //parse the params
            var paramsStr = funcDefStr.match(/\(.*\)/)[0]; // match the first (...)
            paramsStr = paramsStr.substr(1, paramsStr.length - 2); //remove ( and )
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


            //pure params
            var pureParams = JSON.parse(JSON.stringify(params));

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
    consolidate_sublime: function(dictionary) {
        var sublimeFormat = self._getDefaultSublimeJSObject(
            'source.js, source.json, meta.structure.dictionary.json, meta.structure.dictionary.value.json, meta.structure.array.json'
        );
        for (var functionName in dictionary) {
            var functionParams = dictionary[functionName] || "";
            //triggers
            var trigger = functionName.replace(/[.]/g, TRIGGER_SEPARATOR);
            trigger += trigger.indexOf(TRIGGER_SEPARATOR + 'test' + TRIGGER_SEPARATOR) >= 0 ? '\t$A.test' : '\t$A.util';

            //contents
            var contents = functionName + "(" + functionParams + ")";
            //sublime format
            sublimeFormat.completions.push({
                trigger: trigger,
                contents: contents
            });
        }
        return JSON.stringify(sublimeFormat, null, 3);
    },
    consolidate_atom: function(dictionary) {
        var atomFormat = '';
        for (var functionName in dictionary) {
            var functionParams = dictionary[functionName] || "";
            var prefix = functionName;
            var body = functionName + "(" + functionParams + ")";
            atomFormat += ['".source.js":', '\t"' + functionName + '":', '\t\t"prefix":"' + prefix + '"', '\t\t"body":"' + body + '"', ].join('\n') + '\n';
        }
        return atomFormat;
    },
    consolidate_evt_sublime: function(evtDictionary) {
        var sublimeFormat = self._getDefaultSublimeJSObject(
            'source.js'
        );
        for (var evtName in evtDictionary) {
            var evtObj = evtDictionary[evtName];
            var evt = evtObj.evtDef;
            var actualEvt = evtObj.evt;
            if (evt === undefined) {
                console.log('error'.red, evtObj);
                continue;
            }
            // var trigger = 'evt_' + actualEvt.name + '\t$A.Event.' + evtObj.component;
            var trigger = 'evt_'  + actualEvt.name + '\t$A.Event.' + evtObj.component;
            var contents = [
                '//' + 'component=' + evtObj.component,
                '//' + 'evtName=' + actualEvt.name,
                '//' + 'evtType='+ actualEvt.type,
                actualEvt.description ? '//' + actualEvt.description : '',
                'var e = cmp.find("${1:' + evtObj.component + '}").get("e.' + actualEvt.name + '");',
                'e.setParams({'
            ];
            //loop through params and do stuffs
            if (evt.params.length > 0) {
                for (var i = 0; i < evt.params.length; i++) {
                    var evtDef = evt.params[i];
                    contents.push(
                        '\t' + evtDef.name + ': "' + '${' + (i + 2) + ':' + evtDef.type + '}"' + ',' + (evtDef.description ? '// ' + evtDef.description : '')
                        // '\t' + evtDef.name + ': "' + evtDef.type + '"' + ',' + (evtDef.description ? '//' + evtDef.description : '')
                    );
                }
            }

            contents.push('});');
            contents.push('e.fire();');
            //combine to the string
            contents = contents.join('\n')

            //push
            sublimeFormat.completions.push({
                trigger: trigger,
                contents: contents
            });
        };

        return JSON.stringify(sublimeFormat, null, 3);
    },


    /**
     * sample entries
     * 
    attributeObj { name: 'tabItemWidth', type: 'Integer', description: '' }
    attributeComponent { name: 'tabset',
        description: 'A tab set that displays a list of tabs in an unordered list.',
        namespace: 'ui',
        fullComponentTag: 'ui:tabset',
        implements: 'ui:visible' }
     *
     * @param  {[type]} attributeDictionary [description]
     * @return {[type]}                     [description]
     */
    consolidate_attributes_sublime: function(attributeDictionary){
        var sublimeFormat = self._getDefaultSublimeJSObject('text.xml, meta.tag.no-content.xml, punctuation.definition.tag.end.xml');

        for (var attributeIdx in attributeDictionary){
            var attributeComponent = attributeDictionary[attributeIdx].component;
            var attributeObj = attributeDictionary[attributeIdx].attribute;

            // console.log('attributeComponent',attributeComponent);
            // console.log('attributeObj', attributeObj);

            //triggers
            // var trigger = 'attr_' + attributeComponent.namespace + '_' + attributeComponent.name + '_' + attributeObj.name + '\t$A.attr.' + attributeComponent.fullComponentTag;
            var trigger = 'attr_' + attributeComponent.namespace + '_' + attributeComponent.name + '_' + attributeObj.name + '\t$A.attr';

            //contents
            var contents = attributeComponent.name + '="${1:' + attributeComponent.fullComponentTag + '(' +attributeObj.type+')}"';


            //sublime format
            sublimeFormat.completions.push({
                trigger: trigger,
                contents: contents
            });
        }

        return JSON.stringify(sublimeFormat, null, 3);
    },
    _getDefaultSublimeJSObject: function(incomingScope) {
        return {
            "scope": incomingScope || "source",
            "completions": []
        };
    },
    writeToFile: function(string, path) {
        console.log(path.yellow);
        fs.writeFileSync(path, string);
    },
    getBaseFileNameWithoutExtension: function(fileName){
        var shortFileName = path.basename(fileName);
        return shortFileName.substr(0, shortFileName.indexOf('.'));
    },
    getComponentBreakup: function(fileName){
        var splits = fileName.split('/');

        return [splits[splits.length - 3], splits[splits.length - 2]]
    }
};
module.exports = self;