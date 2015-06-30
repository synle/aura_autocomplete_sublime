//dependencies
var path = require('path');


//vars
var baseDir = path.join(process.cwd(), './aura_upstream');

module.exports = {
    baseDir: baseDir,
    outputDir: './snippet',
    prompt: {
        properties: {
            baseDir: {
                message: 'Absolute Dir to Aura github project'.bold.red,
                default: baseDir,
                required: true
            },
            // outputDir :{
            //  message: 'Directory to output files'.bold.red,
            //     default: './snippet',
            //     required: true   
            // }
        }
    }
};