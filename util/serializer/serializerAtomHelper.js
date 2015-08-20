//depdencies
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var util = require('../util');

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
        var atomFormat = ["'.source.js':"];

        var contentTemplate = util.getTemplateFunc([
            "\t'{{functionName}}':",
            "\t\t'prefix': '{{normalizedFunctionName}}'",
            "\t\t'body': '{{functionName}}({{annotatedParams}})'"
        ].join('\n'));

        for (var functionName in dictionary) {
            var viewObj = {
                functionName : functionName,
                annotatedParams : dictionary[functionName].annotatedValue || "",
                origParams : dictionary[functionName].origValue || "",
                normalizedFunctionName: functionName.replace(/[.]/g, TRIGGER_SEPARATOR), //replace the . with - so $A.test.assert will become $A-test-assert
                TRIGGER_SEPARATOR : TRIGGER_SEPARATOR
            }

            //sublime format
            atomFormat.push(
                contentTemplate(viewObj)
            );
        }

        return atomFormat.join('\n');
    },

    /**
     { namespace: 'ui',
     componentName: 'inputDateTime',
     fullCompName: 'ui:inputDateTime',
     helpers: [] }
     **/
    consolidate_helperjs: function(helperDictionary){
        var sublimeFormat = self._getDefaultSublimeJSObject(
            'source.js, source.json, meta.structure.dictionary.json, meta.structure.dictionary.value.json, meta.structure.array.json'
        );

        var triggerTemplate = util.getTemplateFunc(
            [
                "helper",
                "{{TRIGGER_SEPARATOR}}",
                "{{namespace}}",
                "{{TRIGGER_SEPARATOR}}",
                "{{componentName}}",
                "{{TRIGGER_SEPARATOR}}",
                "{{functionName}}"
            ].join('')
        );
        var contentTemplate = util.getTemplateFunc(
            "cmp.getDef().getHelper().{{functionName}}({{annotatedParams}})"
        );

        // console.log(helperDictionary);

        _.forEach(helperDictionary, function(cmpHelperObj, componentName){
            var componentName = cmpHelperObj.componentName;
            var namespace = cmpHelperObj.namespace;

            _.forEach(cmpHelperObj.helpers, function(currentComponentHelperObj){
                var viewObj = {
                    componentName : componentName,
                    namespace : namespace,
                    functionName : currentComponentHelperObj.functionName || '',
                    annotatedParams : currentComponentHelperObj.annotatedValue || "",
                    origParams : currentComponentHelperObj.origValue || "",
                    TRIGGER_SEPARATOR : TRIGGER_SEPARATOR
                }

                //sublime format
                sublimeFormat.completions.push({
                    trigger: triggerTemplate(viewObj),
                    contents: contentTemplate(viewObj)
                });
            });
        });

        return '';
        // return sublimeFormat;
    },

    /**
        [...
            {
                component: 'tabset',
                namespace: 'namespace'
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
        var sublimeFormat = self._getDefaultSublimeJSObject(
            'source.js'
        );

        var triggerTemplate = util.getTemplateFunc(
            [
                "evt",
                "{{TRIGGER_SEPARATOR}}",
                "{{evtObj.namespace}}",
                "{{TRIGGER_SEPARATOR}}",
                "{{evtObj.component}}",
                "{{TRIGGER_SEPARATOR}}",
                "{{actualEvt.name}}"
            ].join('')
        );
        var contentTemplate = util.getTemplateFunc(
            [
                '//  component: {{evtObj.component}}',
                '//    evtName: {{actualEvt.name}}',
                '//    evtType: {{actualEvt.type}}',
                '//description: {{actualEvt.description}}',
                'var e = cmp.find("${1:{{evtObj.component}}}").get("e.{{actualEvt.name}}");',
                'e.setParams({',
                '{{contentBody}}',//content body
                '});',
                'e.fire();'
            ].join('\n')
        );

        for (var evtName in arrayEvents) {
            var evtObj = arrayEvents[evtName];
            // console.log(evtObj);
            var evt = evtObj.evtDef;
            var actualEvt = evtObj.evt;
            if (evt === undefined) {
                console.log('error'.red, evtObj);
                continue;
            }

            //loop through params and do stuffs
            var contentBody = [];
            if (evt.params.length > 0) {
                for (var i = 0; i < evt.params.length; i++) {
                    var evtDef = evt.params[i];
                    contentBody.push(
                        '\t' + evtDef.name + ': "' + '${' + (i + 2) + ':' + evtDef.type + '}"' + ',' + (evtDef.description ? '// ' + evtDef.description : '')
                        // '\t' + evtDef.name + ': "' + evtDef.type + '"' + ',' + (evtDef.description ? '//' + evtDef.description : '')
                    );
                }
            }
            contentBody = contentBody.join('\n');


            var viewObj = {
                evtObj: evtObj,
                actualEvt: actualEvt,
                contentBody : contentBody,
                TRIGGER_SEPARATOR : TRIGGER_SEPARATOR
            }

            //push
            sublimeFormat.completions.push({
                trigger: triggerTemplate(viewObj),
                contents: contentTemplate(viewObj)
            });
        };


        return '';
        // return sublimeFormat;
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
        var sublimeFormat = self._getDefaultSublimeJSObject(
            'text.xml, meta.tag.no-content.xml, punctuation.definition.tag.end.xml'
            // 'text.xml, meta.tag.no-content.xml, punctuation.definition.tag.end.xml'
        );

        // var access = {};
        for (var attributeIdx in arrayAttributes){
            var attributeComponent = arrayAttributes[attributeIdx].component;
            var attributeObj = arrayAttributes[attributeIdx].attribute;
            var attribType = arrayAttributes[attributeIdx].type;//type : attribute or event

            //triggers
            // var trigger = 'attr_' + attributeComponent.namespace + '_' + attributeComponent.name + '_' + attributeObj.name + '\t$A.attr.' + attributeComponent.fullComponentTag;
            var trigger = attributeComponent.namespace + TRIGGER_SEPARATOR + attributeComponent.name + TRIGGER_SEPARATOR + attributeObj.name + '\tAttr';


            // console.log('attributeComponent', attributeComponent);
            // console.log('attributeObj', attributeObj);
            //contents
            var contents = self._serializeAttr(
                attributeObj.name,//attributeName
                attributeComponent.fullComponentTag,//fullComponentTagStr
                attributeObj.type,//atributeType
                attributeObj.required === 'true' || attributeObj.required === true,//isRequired
                1,//sublime tab index
                attributeObj.TAG
            );

            // console.log(contents);


            //sublime format
            sublimeFormat.completions.push({
                trigger: trigger,
                contents: contents
            });

            // console.log(attributeObj);
        }
        // console.log(access);


        return '';
        // return sublimeFormat;
    },

    _serializeAttr : function(attributeName, fullComponentTagStr, atributeType, isRequired, sublimeTabIdx, attribType){
        return  attributeName + '="${'+sublimeTabIdx+':' +  fullComponentTagStr + (isRequired ? ' - Required' : ' - Optional') + ' - ' +atributeType+'}"';
    },

    _serializeAttr_short : function(attributeName, fullComponentTagStr, atributeType, isRequired, sublimeTabIdx, attribType){
        return  attributeName + '="${'+sublimeTabIdx+':'  + (isRequired ? 'Required' : 'Optional') + ' - ' +atributeType+'}"';
    },

    /**
     [
        ...
        { name: 'virtualDataGridKitchenSink',
            description: '',
            namespace: 'uiExamples',
            fullComponentTag: 'uiExamples:virtualDataGridKitchenSink',
            implements: '',
            attributes: [...
                { name: 'tabItemWidth', type: 'Integer', description: '' }
            ...attributeObj] }
        ...
     ]
     */
    consolidate_uitags: function(arrayComponents){
        var sublimeFormat = self._getDefaultSublimeJSObject(
            // 'meta.tag.xml'
            'text.xml'
        );


        for (var idx in arrayComponents){
            var componentObj = arrayComponents[idx];
            var attributeArray = componentObj.attributes;


            //
            //
            //simplify content
            //triggers
            //
            var trigger = componentObj.namespace + TRIGGER_SEPARATOR + componentObj.name  + '\tTag Simple';


            //not
            //contents
            var contents = [
                componentObj.fullComponentTag + '$1>${2:',
                componentObj.implements.length > 0 ? 'Implements '+componentObj.implements + '.\t' : '',
                componentObj.description,
                '}</'+componentObj.fullComponentTag+'>'
            ].join('');
            
            sublimeFormat.completions.push({
                trigger: trigger,
                contents: contents
            });


            // 
            //expanded content
            //
            var trigger = componentObj.namespace + TRIGGER_SEPARATOR + componentObj.name  + '\tTag Full';

            var contents = [
                componentObj.fullComponentTag,
            ];

            var includedAttributeCount = 0;


            //required attributes
            _.forEach(attributeArray, function(attributeObj, attributeArrayIdx){
                if ((attributeObj.access || '').toLowerCase() !== 'private' && attributeObj.name.indexOf('_') !== 0){
                    if(attributeObj.required === true || attributeObj.required === 'true'){
                        includedAttributeCount++;

                        // contents.push(attributeObj.name + '="('+attributeObj.type+')"');
                        contents.push(
                            ' ' + self._serializeAttr_short(
                                attributeObj.name,//attributeName
                                componentObj.fullComponentTag,//fullComponentTagStr
                                attributeObj.type,//atributeType
                                attributeObj.required === 'true' || attributeObj.required === true,//isRequired
                                includedAttributeCount,//sublime tab index
                                attributeObj.TAG
                            )
                        );

                        // console.log(componentObj.fullComponentTag)
                    }
                }
            });


            //optional attributes
            _.forEach(attributeArray, function(attributeObj, attributeArrayIdx){
                if ((attributeObj.access || '').toLowerCase() !== 'private' && attributeObj.name.indexOf('_') !== 0){
                    if(attributeObj.required !== true && attributeObj.required !== 'true'){
                        includedAttributeCount++;

                        // contents.push(attributeObj.name + '="('+attributeObj.type+')"');
                        contents.push(
                            ' ' + self._serializeAttr_short(
                                attributeObj.name,//attributeName
                                componentObj.fullComponentTag,//fullComponentTagStr
                                attributeObj.type,//atributeType
                                attributeObj.required === 'true' || attributeObj.required === true,//isRequired
                                includedAttributeCount,//sublime tab index
                                attributeObj.TAG
                            )
                        );

                        // console.log(componentObj.fullComponentTag)
                    }
                }
            });


            //increment tab index
            if(includedAttributeCount === 0){
                includedAttributeCount = 1;//special case where no index found
            }
            else{
                //increment it
                includedAttributeCount++;
            }

            contents.push( '>')
            contents.push( '${'+ (includedAttributeCount) + ':')
            contents.push( componentObj.implements.length > 0 ? 'Implements '+componentObj.implements + '.\t' : '')
            contents.push( componentObj.description)
            contents.push( '}</'+componentObj.fullComponentTag+'>')


            contents = contents.join('');
            // console.log(componentObj.name, attributeArray.length)
            // console.log(componentObj);


            //sublime format
            sublimeFormat.completions.push({
                trigger: trigger,
                contents: contents
            });
        }



        return '';
        // return sublimeFormat;
    },

    _getDefaultSublimeJSObject: function(incomingScope) {
        return {
            "scope": incomingScope || "source",
            "completions": []
        };
    }
};
module.exports = self;