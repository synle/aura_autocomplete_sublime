//depdencies
var fs = require('fs');
var path = require('path');

//vars
var TRIGGER_SEPARATOR = '-';

//definitions
var self = {
    consolidate_js: function(dictionary) {
        var atomFormat = '';
        for (var functionName in dictionary) {
            var functionParams = dictionary[functionName] || "";
            var prefix = functionName;
            var body = functionName + "(" + functionParams + ")";
            atomFormat += ['".source.js":', '\t"' + functionName + '":', '\t\t"prefix":"' + prefix + '"', '\t\t"body":"' + body + '"', ].join('\n') + '\n';
        }
        return atomFormat;
    },
    consolidate_evt: function(evtDictionary) {
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
    consolidate_attributes: function(attributeDictionary){
    },


    consolidate_uitags: function(componentDictionary){
    }
};
module.exports = self;