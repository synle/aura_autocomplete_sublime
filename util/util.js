var Mustache = require('mustache');

module.exports = {
	getTemplateFunc: function(templateStr){
		return Mustache.render.bind(undefined, templateStr);
	}
}