//depdencies
var path = require('path');
var fs = require('fs');

var baseDir = '/Users/syle/git/aura/';
var testJsPath = path.join(
	baseDir,
	'aura-impl/target/classes/aura/test/Test.js'
);

var utilJsPath = path.join(
	baseDir,
	'aura-impl/target/classes/aura/util/Util.js'
)
console.log(testJsPath);
console.log(utilJsPath);