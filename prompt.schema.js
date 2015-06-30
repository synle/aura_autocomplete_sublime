module.exports = {
    properties: {
        baseDir: {
            message: 'Absolute Dir to Aura github project'.bold.red,
            default: '/Users/sle/git/aura',
            required: true
        },
        outputDir :{
        	message: 'Directory to output files'.bold.red,
            default: './snippet',
            required: true	
        }
    }
};