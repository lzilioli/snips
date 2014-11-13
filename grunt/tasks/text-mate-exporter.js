var _ = require( 'underscore' );
var fs = require( 'fs' );
var path = require( 'path' );
var mkpath = require( 'mkpath' );
var util = require( 'lz-node-utils' );

module.exports = function( grunt ) {
	grunt.registerMultiTask( 'text-mate', 'Export the snippets in a format for TextMate.', function() {

		// Cuz screw typing all that
		var opts = this.data.options;

		// Load the snippets
		var snippetLoader = global.req( 'snippet-loader' );
		var snippetData = snippetLoader.load( opts );

		// Gotta know where to get 'em
		if ( !opts.snippetSource ) {
			grunt.fail.fatal( 'No snippetSource specified' );
		}
		// Gotta know where to put 'em
		if ( !opts.snippetDest ) {
			grunt.fail.fatal( 'No snippetDest specified' );
		}

		// Make sure directories up to the DB exist (like mkdir -p)
		mkpath.sync( global.pth( opts.snippetDest ) );

		// Get a map from file source to destination
		var destMap = util.file.expandMapping( opts.snippetSource, opts.snippetDest, {
			flatten: true,
			ext: opts.outputExtension || undefined
		} );

		// Loop over and insert all of the snippets
		_.each( snippetData.snippets, function( snippet ) {
			insertSnippet( snippet, destMap[ snippet.__filepath ] );
		} );
	} );
};

/******************************************************************************
 *****     HELPERS    *********************************************************
 ******************************************************************************/

function insertSnippet( snippet, snippetDest ) {
	// Make sure the directory exists  (like mkdir -p)
	mkpath.sync( path.dirname( snippetDest ) );
	fs.writeFileSync( snippetDest, snippet.__content );
}
