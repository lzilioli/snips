var shell = require( 'shelljs' );

module.exports = function( grunt ) {
	grunt.registerTask( 'hooks', function() {
		shell.cp( 'grunt/hooks/*', '.git/hooks/' );
	} );
};
