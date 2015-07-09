//depdencies
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

//vars
var TRIGGER_SEPARATOR = '-';

//definitions
var self = {
    /**
     {
        ...
         'A.util.map':
            {
                annotatedValue: [ '${1:array}', '${2:method}', '${3:that}' ],
                origValue: 'array, method, that' 
            }
        ...
     }
     */ 
    consolidate_js: function(dictionary) {
        var atomFormat = '';
        for (var functionName in dictionary) {
            var annotatedParams = dictionary[functionName].annotatedValue || "";
            var origParams = dictionary[functionName].origValue || "";


            var prefix = functionName.replace(/\./g, '-');
            var body = functionName + "(" + origParams + ")";
            

            atomFormat += [
                '".source.js":',
                '\t"' + functionName + '":',
                '\t\t"prefix":"' + prefix + '"',
                '\t\t"body":"' + body + '"',
            ].join('\n') + '\n';
        }
        return atomFormat;
    },


    consolidate_helperjs: function(helperDictionary){

    },


    /**
        [...
            {
                component: 'tabset',
                    evt:
                     { name: 'onActivate',
                       type: 'ui:tabsetEvent',
                       description: 'The event is triggered when the tab is activated.' },
                evtDef:
                     { name: 'tabsetEvent',
                       description: 'Event for ui:tabset component.',
                       params: [Object],
                       fileName: '/Users/sle/git/typeahead_aura/aura_upstream/aura-components/src/main/components/ui/tabsetEvent/tabsetEvent.evt' }
            } 
        ...]  
    **/
    consolidate_evt: function(arrayEvents) {
    },


    /**
     * sample entries
     * 
        [
        ...
            {
            attributeObj { name: 'tabItemWidth', type: 'Integer', description: '' }
            attributeComponent { name: 'tabset',
                description: 'A tab set that displays a list of tabs in an unordered list.',
                namespace: 'ui',
                fullComponentTag: 'ui:tabset',
                implements: 'ui:visible' 
                }
            }
        ...
        ]
     */
    consolidate_attributes: function(arrayAttributes){
    },



    /**
     [
        ...
        { name: 'virtualDataGridKitchenSink',
            description: '',
            namespace: 'uiExamples',
            fullComponentTag: 'uiExamples:virtualDataGridKitchenSink',
            implements: '' }
        ...
     ]
     */
    consolidate_uitags: function(arrayComponents){
    }
};
module.exports = self;