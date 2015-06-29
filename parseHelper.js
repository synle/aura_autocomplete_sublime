//depdencies
var fs = require('fs');
var path = require('path');
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
            } else {
                params = [paramsStr];
            }
            //shorten and trim bad character
            var pureParams = JSON.parse(JSON.stringify(params));
            for (var i = 0; i < params.length; i++) {
                params[i] = '$' + (i + 1) + self.shortenName(params[i]);
            }
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
        var sublimeFormat = self._getDefaultSublimeJSObject();
        for (var functionName in dictionary) {
            var functionParams = dictionary[functionName] || "";
            //triggers
            var trigger = functionName.replace(/[.]/g, '_');
            trigger += trigger.indexOf('_test_') >= 0 ? '\t$A.test' : '\t$A.util';
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
        var sublimeFormat = self._getDefaultSublimeJSObject();
        for (var evtName in evtDictionary) {
            var evtObj = evtDictionary[evtName];
            var evt = evtObj.evtDef;
            var actualEvt = evtObj.evt;
            if (evt === undefined) {
                console.log('error'.red, evtObj);
                continue;
            }
            var trigger = 'evt_' + actualEvt.name + '_' + evtObj.component + '\t$A.Event';
            var contents = [
                actualEvt.description ? '//' + actualEvt.description : '', 'var e = cmp.find("$1' + evtObj.component + '").get("e.' + actualEvt.name + '");', 'e.setParams({'
            ];
            //loop through params and do stuffs
            if (evt.params.length > 0) {
                for (var i = 0; i < evt.params.length; i++) {
                    var evtDef = evt.params[i];
                    contents.push(evtDef.name + ': "' + '$' + (i + 2) + evtDef.type + '"' + ',' + (evtDef.description ? '// ' + evtDef.description : ''));
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
    _getDefaultSublimeJSObject: function() {
        return {
            // "scope": "source, js",
            "scope": "source",
            "completions": []
        };
    },
    writeToFile: function(string, path) {
        console.log(path.yellow);
        fs.writeFileSync(path, string);
    }
};
module.exports = self;