var assert = require("assert");
var fs = require('fs');
var path = require('path');
describe('Sublime Text 3 - Snippet Validation', function() {
    it('aura.js.sublime-completions is valid', function() {
        var fileName = 'aura.js.sublime-completions';
        assertSublimeContent(fileName, _readSnippet(fileName));
    });
    it('aura.attributes.sublime-completions is valid', function() {
        var fileName = 'aura.attributes.sublime-completions';
        assertSublimeContent(fileName, _readSnippet(fileName));
    });
    it('aura.uitags.sublime-completions is valid', function() {
        var fileName = 'aura.uitags.sublime-completions';
        assertSublimeContent(fileName, _readSnippet(fileName));
    });
    it('aura.event.js.sublime-completions is valid', function() {
        var fileName = 'aura.event.js.sublime-completions';
        assertSublimeContent(fileName, _readSnippet(fileName));
    });

    function _readSnippet(fileName) {
        return fs.readFileSync(path.join('./snippet', fileName), 'utf-8');
    }

    function assertSublimeContent(fileName, content) {
        try {
            var parsed = JSON.parse(content);
            assert.equal(true, parsed.scope !== undefined && parsed.scope.length > 0, fileName + ' : doesnt have a valid scope.');
            assert.equal(true, parsed.completions !== undefined && parsed.completions.length > 0, fileName + ' : doesnt have a valid completions list.');
            assert.equal(true, parsed.completions[0].trigger !== undefined && parsed.completions[0].trigger.length > 0, fileName + ' : doesnt have a valid completions entry trigger.');
            assert.equal(true, parsed.completions[0].contents !== undefined && parsed.completions[0].contents.length > 0, fileName + ' : doesnt have a valid completions entry contents.');
        } catch (ex) {
            assert.fail(true, false, fileName + ' file cannot be parsed.', '###')
        }
    }
})