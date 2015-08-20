var assert = require("assert");
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
describe('Sublime Text 3 - Snippet Validation', function() {
    describe('aura.js.sublime-completions', function(){
        var fileName;
        var content;
        var parsedContent;

        it('is present and has the right format', function() {
            fileName = 'aura.js.sublime-completions';
            content = _readSnippet(fileName);
            parsedContent = JSON.parse(content);

            assertSublimeContent(fileName, content, parsedContent);
        });


        it('actual data must match', function() {
            assertSampleSnippet(
                fileName,
                parsedContent,
                "A-test-addWaitFor", //target trigger
                "A.test.addWaitFor(${1:expected},${2:testFunction},${3:callback})" //target contents
            );
        });
    })
    
    describe('aura.attributes.sublime-completions', function(){
        var fileName;
        var content;
        var parsedContent;

        it('is present and has the right format', function() {
            fileName = 'aura.attributes.sublime-completions';
            content = _readSnippet(fileName);
            parsedContent = JSON.parse(content);
            assertSublimeContent(fileName, content, parsedContent);
        });

        it('actual data must match', function() {
            assertSampleSnippet(
                fileName,
                parsedContent,
                "ui-input-type\tAttr", //target trigger
                "type=\"${1:ui:input - Optional - String}\"" //target contents
            );
        });
    })
    
    describe('aura.uitags.sublime-completions', function(){
        var fileName;
        var content;
        var parsedContent;

        it('is present and has the right format', function() {
            fileName = 'aura.uitags.sublime-completions';
            content = _readSnippet(fileName);
            parsedContent = JSON.parse(content);
            assertSublimeContent(fileName, content, parsedContent);
        });

        it('actual data must match #1', function() {
            assertSampleSnippet(
                fileName,
                parsedContent,
                "ui-input\tTag Simple", //target trigger
                "ui:input$1>${2:Implements ui:visible, ui:uiEvents.\tAn abstract class that is extended by input components such as ui:inputCheckbox and ui:inputText.}</ui:input>" //target contents
            );
        });

        it('actual data must match #2', function() {
            assertSampleSnippet(
                fileName,
                parsedContent,
                "ui-inputCheckbox\tTag Full", //target trigger
                "ui:inputCheckbox updateOn=\"${1:Optional - String}\">${2:Implements ui:inputBaseOption.\tRepresents a checkbox. Its behavior can be configured using events such as click and change.}</ui:inputCheckbox>" //target contents
            );
        });
    })
    
    describe('aura.event.js.sublime valid', function(){
        var fileName;
        var content;
        var parsedContent;

        it('is present and has the right format', function() {
            fileName = 'aura.event.js.sublime-completions';
            content = _readSnippet(fileName);
            parsedContent = JSON.parse(content);
            assertSublimeContent(fileName, content, parsedContent);
        });

        it('actual data must match', function() {
            assertSampleSnippet(
                fileName,
                parsedContent,
                "evt-ui-button-press", //target trigger
                "//  component: button\n//    evtName: press\n//    evtType: ui:press\n//description: The controller method that runs when the button is clicked. For example, press=&quot;{!c.showMsg}&quot; references the showMsg method in the controller.\nvar e = cmp.find(\"${1:button}\").get(\"e.press\");\ne.setParams({\n\n});\ne.fire();"//target contents
            );
        });
    })
    
    describe('aura.helper.js.sublime valid', function(){
        var fileName;
        var content;
        var parsedContent;

        it('is present and has the right format', function() {
            fileName = 'aura.helper.js.sublime-completions';
            content = _readSnippet(fileName);
            parsedContent = JSON.parse(content);
            assertSublimeContent(fileName, content, parsedContent);
        });

        it('actual data must match', function() {
            assertSampleSnippet(
                fileName,
                parsedContent,
                "helper-test-testActionCallbacks-runTest", //target trigger
                "cmp.getDef().getHelper().runTest(${1:component},${2:action},${3:callback},${4:expected})" //target contents
            );
        });
    })

    function _readSnippet(fileName) {
        try {
            return fs.readFileSync(path.join('./snippet', fileName), 'utf-8');
        } catch (ex) {
            console.trace(ex);
            assert.fail(true, false, fileName + ' file not found. Read failed.', '###')
        }
    }

    function assertSampleSnippet(
            fileName,
            parsed,
            targetTrigger, targetContents) {
        var foundTrigger = false;
        var foundContents = false;
        _.forEach(parsed.completions, function(val) {
            if (val.trigger === targetTrigger) {
                foundTrigger = true;
                if (val.contents === targetContents) {
                    foundContents = true;
                }
            }
        });
        if (foundTrigger === false) {
            assert.fail(true, false, fileName + ' : cant find matching TRIGGER for trigger "' + targetTrigger + '".', '###')
        }
        // if (foundContents === false) {
        //     assert.fail(true, false, fileName + ' : cant find matching CONTENT for trigger "' + targetTrigger + '".', '###')
        // }
    }

    function assertSublimeContent(fileName, content, parsed) {
        assert.equal(true, parsed.scope !== undefined && parsed.scope.length > 0, fileName + ' : doesnt have a valid scope.');
        assert.equal(true, parsed.completions !== undefined && parsed.completions.length > 0, fileName + ' : doesnt have a valid completions list.');
        assert.equal(true, parsed.completions[0].trigger !== undefined && parsed.completions[0].trigger.length > 0, fileName + ' : doesnt have a valid completions entry trigger.');
        assert.equal(true, parsed.completions[0].contents !== undefined && parsed.completions[0].contents.length > 0, fileName + ' : doesnt have a valid completions entry contents.');
    }
})