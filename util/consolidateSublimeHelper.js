//depdencies
var fs = require('fs');
var path = require('path');

//vars
var TRIGGER_SEPARATOR = '-';

//definitions
var self = {
    consolidate_js: function(dictionary) {
        var sublimeFormat = self._getDefaultSublimeJSObject(
            'source.js, source.json, meta.structure.dictionary.json, meta.structure.dictionary.value.json, meta.structure.array.json'
        );
        for (var functionName in dictionary) {
            var functionParams = dictionary[functionName] || "";
            //triggers
            var trigger = functionName.replace(/[.]/g, TRIGGER_SEPARATOR);
            trigger += trigger.indexOf(TRIGGER_SEPARATOR + 'test' + TRIGGER_SEPARATOR) >= 0 ? '\t$A' : '\t$A';

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
    consolidate_evt: function(evtDictionary) {
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
            var trigger = 'evt' + TRIGGER_SEPARATOR  + evtObj.component + TRIGGER_SEPARATOR  + actualEvt.name + '\t$A';
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
    consolidate_attributes: function(attributeDictionary){
        var sublimeFormat = self._getDefaultSublimeJSObject('text.xml, meta.tag.no-content.xml, punctuation.definition.tag.end.xml');

        for (var attributeIdx in attributeDictionary){
            var attributeComponent = attributeDictionary[attributeIdx].component;
            var attributeObj = attributeDictionary[attributeIdx].attribute;

            //triggers
            // var trigger = 'attr_' + attributeComponent.namespace + '_' + attributeComponent.name + '_' + attributeObj.name + '\t$A.attr.' + attributeComponent.fullComponentTag;
            var trigger = 'attr-' + attributeComponent.namespace + '-' + attributeComponent.name + '-' + attributeObj.name + '\t$A';

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


    consolidate_uitags: function(componentDictionary){
        var sublimeFormat = self._getDefaultSublimeJSObject(
            'meta.tag.xml'
        );


        for (var idx in componentDictionary){
            var componentObj = componentDictionary[idx];

            //triggers
            var trigger = 'tag'+ TRIGGER_SEPARATOR + componentObj.namespace + '-' + componentObj.name + '\t$A';

            //contents
            var contents = [
                componentObj.fullComponentTag + '$1>${2:',
                componentObj.implements.length > 0 ? '\nImplements '+componentObj.implements + '.\n' : '',
                componentObj.description,
                '}</'+componentObj.fullComponentTag+'>'
            ].join('');


            // console.log(componentObj);


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
    }
};
module.exports = self;