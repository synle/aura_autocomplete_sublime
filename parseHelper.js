//depdencies
var fs = require('fs');
//definitions
var self = {
    readFromFile: function(path) {
        console.log('Reading file...'.yellow.bold);
        console.log(path.yellow);
        return fs.readFileSync(path, 'utf-8');
    },
    parseFunctions: function(functionName, functionDefition, namespaceStr) {
        if (typeof functionDefition === 'function') {
            //get function definitions as string
            var funcDefStr = functionDefition.toString();
            //parse the params
            var paramsStr = funcDefStr.match(/\(.*\)/)[0]; // match the first (...)
            paramsStr = paramsStr.substr(1, paramsStr.length - 2); //remove ( and )

            var params;//params array
            if(paramsStr.indexOf('*') === -1){
            	//no closure comment, do it this way (array)
            	//convert params string to array
            	params = paramsStr.split(', ');
            }
            else{
            	params = [paramsStr];
            }

           	//shorten and trim bad character
            for (var i = 0; i < params.length; i++) {
                params[i] = '$' + (i + 1) + self.shortenName(params[i]);
            }
        	
            
            //output
            // console.log((namespaceStr + functionName).green.bold.underline + ':\t');
            // console.log(params.join('\n').cyan);

            return [namespaceStr + functionName, params];
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
    consolidate: function(dictionary){
    	var sublimeFormat = {
			"scope": "source, js",
			"completions":[]
		};


    	for (var functionName in dictionary){
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
    writeToFile:function(string){
    	fs.writeFileSync('./tmp.aura.sublime-completions', string)
    }
};
module.exports = self;