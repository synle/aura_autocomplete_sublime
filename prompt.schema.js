var path = require('path');

module.exports = {
    properties: {
        baseDir: {
            message: 'Absolute Dir to Aura github project'.bold.red,
            default: path.join(
                process.cwd(),
                './aura_upstream'
            ),
            required: true
        },
        // outputDir :{
        // 	message: 'Directory to output files'.bold.red,
        //     default: './snippet',
        //     required: true	
        // }
    }
};
