var _ = require( 'underscore' );
var path = require( 'path' );
var childProc = require( 'child_process' );

// will pass current program arguments, unless args is specified
module.exports = exports = function snip( cmd, args ) {
	if ( args && !_.isArray( args ) ) {
		throw new Error( 'args must be an array' );
	}
	childProc.fork( path.join( __dirname, '../../bin/snips-' + cmd + '.js' ), ( args || process.argv.slice( 3 ) ) );
};
