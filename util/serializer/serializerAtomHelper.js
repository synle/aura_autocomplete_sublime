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
      var atomFormat = "'.source.js':\n";
      for (var functionName in dictionary) {
          var annotatedParams = dictionary[functionName].annotatedValue || "";
          var origParams = dictionary[functionName].origValue || "";

          var prefix = functionName.replace(/\./g, '-');
          var body = functionName + "(" + origParams + ")";


          atomFormat += [
              "\t'" + functionName + "':",
              "\t\t'prefix': '" + prefix + "'",
              "\t\t'body': '" + body + "'",
          ].join('\n') + '\n';
      }
      return atomFormat;
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

        // console.log(helperDictionary);

        _.forEach(helperDictionary, function(cmpHelperObj, componentName){
            var componentName = cmpHelperObj.componentName;
            var namespace = cmpHelperObj.namespace;

            _.forEach(cmpHelperObj.helpers, function(currentComponentHelperObj){
                var annotatedParams = currentComponentHelperObj.annotatedValue || "";
                var origParams = currentComponentHelperObj.origValue || "";
                var functionName = currentComponentHelperObj.functionName || ''

                //triggers
                var trigger = 'helper' + TRIGGER_SEPARATOR + namespace + TRIGGER_SEPARATOR + componentName + TRIGGER_SEPARATOR + functionName ;

                //contents
                var contents = 'cmp.getDef().getHelper().' + functionName + "(" + annotatedParams + ")";


                //sublime format
                sublimeFormat.completions.push({
                    trigger: trigger,
                    contents: contents
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
        for (var evtName in arrayEvents) {
            var evtObj = arrayEvents[evtName];
            // console.log(evtObj);
            var evt = evtObj.evtDef;
            var actualEvt = evtObj.evt;
            if (evt === undefined) {
                console.log('error'.red, evtObj);
                continue;
            }
            // var trigger = 'evt_' + actualEvt.name + '\t$A.Event.' + evtObj.component;
            var trigger = 'evt' + TRIGGER_SEPARATOR  + evtObj.namespace + TRIGGER_SEPARATOR  + evtObj.component + TRIGGER_SEPARATOR  + actualEvt.name ;
            var contents = [
                '//' + '  component: ' + evtObj.component,
                '//' + '    evtName: ' + actualEvt.name,
                '//' + '    evtType: '+ actualEvt.type,
                '//' + 'description: ' + (actualEvt.description || ''),
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
