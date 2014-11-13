var _ = require( 'underscore' );
var fs = require( 'fs' );
var path = require( 'path' );
var mkpath = require( 'mkpath' );
var util = require( 'lz-node-utils' );

module.exports = function( grunt ) {
	grunt.registerMultiTask( 'text-mate', 'Export the snippets in a format for TextMate.', function() {

		var opts = this.data.options;

		var snippets = global.req( 'snippet-loader' );
		var snippetData = snippets.load( opts );

		if ( !opts.snippetDest ) {
			throw new Error( 'No snippetDest specified' );
		}

		// Make sure directories up to the DB exist (like mkdir -p)
		mkpath.sync( global.pth( opts.snippetDest ) );

		// Get a map from file source to destination
		// TODO: Isn't there a better way?
		var destMap = util.file.expandMapping( opts.snippetSource, opts.snippetDest, {
			trim: 'snippets/',
			ext: opts.outputExtension || undefined
		} );

		// Insert the things
		_.each( snippetData.snippets, function( snippet ) {
			insertSnippet( snippet, destMap[ snippet.__filepath ] );
		} );
	} );
};

/******************************************************************************
 *****     HELPERS    *********************************************************
 ******************************************************************************/

function insertSnippet( snippet, snippetDest ) {
	mkpath.sync( path.dirname( snippetDest ) );
	fs.writeFileSync( snippetDest, snippet.__content );
}
