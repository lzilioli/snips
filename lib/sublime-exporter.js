var Q = require( 'Q' );
var _ = require( 'underscore' );
var fs = require( 'fs' );
var path = require( 'path' );
var mkpath = require( 'mkpath' );
var util = require( 'lz-node-utils' );
var fromLib = util.getReqFn( 'lib' );
var snips = fromLib( 'snips' );
var logger = snips.logger;
var snippetLoader = fromLib( 'snippet-loader' );

module.exports = function( opts ) {

	var deferred = Q.defer();

	// Load the snippets
	var snippetData = snippetLoader.load( opts );

	// Gotta know where to get 'em
	if ( !opts.snippetSource ) {
		throw new Error( 'No snippetSource specified' );
	}
	// Gotta know where to put 'em
	if ( !opts.snippetDest ) {
		throw new Error( 'No snippetDest specified' );
	}

	// Make sure directories up to the DB exist (like mkdir -p)
	mkpath.sync( opts.snippetDest );

	// Get a map from file source to destination
	var destMap = util.file.expandMapping( opts.snippetSource, opts.snippetDest, {
		flatten: true,
		ext: opts.outputExtension || undefined
	} );

	// Loop over and insert all of the snippets
	_.each( snippetData.snippets, function( snippet ) {
		var dest = destMap[ snippet.__filepath ];
		if ( !dest ) {
			logger.user( [
				'An unknown error occurred while exporting snippet:',
				snippet.__filepath
			].join( ' ' ).red );
			process.exit( 1 );
		}
		insertSnippet( snippet, dest );
	} );

	deferred.resolve( true );

	return deferred.promise;
};

/******************************************************************************
 *****     HELPERS    *********************************************************
 ******************************************************************************/

function insertSnippet( snippet, snippetDest ) {
	// Make sure the directory exists  (like mkdir -p)
	mkpath.sync( path.dirname( snippetDest ) );
	fs.writeFileSync( snippetDest, snippet.__content );
}
