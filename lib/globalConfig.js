var _ = require( 'underscore' );
var fs = require( 'fs' );
var path = require( 'path' );

global.pth = function() {
	// push the path to the root directory as the first argument
	Array.prototype.unshift.apply( arguments, [ process.cwd() ] );
	// return the result of path.join on the new arguments array
	return path.join.apply( this, arguments );
};

global.req = function( pathToModule, fromRoot ) {
	var requirePath = global.pth( ( !!fromRoot ? '' : 'lib' ), pathToModule );
	return require( requirePath );
};

// Load app configuration
var appSettings = require( global.pth( 'config/default-settings.js' ) );
if ( fs.existsSync( global.pth( 'config/settings.js' ) ) ) {
	var userSettings = global.req( 'config/settings.js', true );
	appSettings = _.extend( {}, appSettings, userSettings );
}

global.config = appSettings;
