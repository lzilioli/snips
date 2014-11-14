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

	grunt.registerTask( 'text-mate-post-export', function( target ) {
		var opts = grunt.config( 'text-mate.' + target + '.options' );
		grunt.log.writeln( 'Your snippets have been exported to ', opts.snippetDest );
		if ( target === 'sublime' ) {
			var symLinkDest = '~/Library/Application Support/Sublime Text 3/Packages/SublimeSnippets';
			if ( !grunt.file.exists( symLinkDest ) ) {
				var repoRoot = global.pth( '/' );
				var exportedSnippetDest = path.join( repoRoot, '/export/sublimeSnippets/' );
				grunt.log.writeln( 'To install them for SublimeText3, run the following command:' );
				grunt.log.writeln( [
					'$'.grey,
					'ln -s'.blue,
					exportedSnippetDest.blue,
					symLinkDest.blue
				].join( ' ' ) );
			}
		}
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
