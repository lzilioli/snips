var shell = require( 'shelljs' );
var snips = require( '../snips' );
var logger = snips.logger;

module.exports = {
	gitCheck: function() {
		shell.config.silent = true;
		var hasGit = shell.exec( 'which git' ).code === 0;
		shell.config.silent = false;
		if ( !hasGit ) {
			logger.user( 'You must have git installed on the system.'.red );
			process.exit( 1 );
		}
	}
};
