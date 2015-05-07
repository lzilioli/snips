var fs = require( 'fs' );
var util = require( 'util' );
var path = require( 'path' );
var mkpath = require( 'mkpath' );
var _ = require( 'underscore' );
var Q = require( 'Q' );
var lzUtils = require( 'lz-node-utils' );
var snips = require( '../snips' );
var Exporter = snips.proto.Exporter;

module.exports = exports = SublimeExporter;
util.inherits( SublimeExporter, Exporter );

function SublimeExporter() {
	this.name = 'Sublime';
	var sublimeTranslator = require( '../translators/sublime' );
	this.translator = new sublimeTranslator();
	this.snippetDest = path.join( snips.exportDir, 'SublimeSnippets/' );
	Exporter.call( this );
}

SublimeExporter.prototype.export = function() {

	var deferred = Q.defer();

	// Make sure directories up to the DB exist (like mkdir -p)
	mkpath.sync( this.snippetDest );

	// Get a map from file source to destination
	var destMap = lzUtils.file.expandMapping( this.snippetSource, this.snippetDest, {
		flatten: true,
		ext: '.sublime-snippet'
	} );

	// Loop over and insert all of the snippets
	_.each( this.snippetData.data.snippets, function( snippet ) {
		var dest = destMap[ snippet.__filepath ];
		if ( !dest ) {
			snips.logger.user( [
				'An unknown error occurred while exporting snippet:',
				'      ' + snippet.__filepath,
				'      Its likely that your snippets directory contains multiple',
				'      snippets with the same name.'
			].join( '\n' ).red );
		} else {
			insertSnippet( snippet, dest );
		}
	} );

	deferred.resolve( true );

	return deferred.promise;
};

SublimeExporter.prototype.afterExport = function() {
	var symLinkDest = path.join( process.env.HOME, 'Library/Application Support/Sublime Text 3/Packages/SnipsExport' );
	var rmMod = '';
	var needsToLink = true;
	var needsToRm = true;

	if ( !fs.existsSync( symLinkDest ) ) {
		needsToRm = false;
	} else {
		// If something exists at the destination
		var stats = fs.lstatSync( symLinkDest );
		if ( stats.isSymbolicLink() ) {
			// Make sure it is symlinked to the correct directory
			var linkedTo = fs.readlinkSync( symLinkDest );
			if ( linkedTo !== this.snippetDest ) {
				snips.logger.user( [
					'You already have snippets symlinked',
					'in SublimeText3:\n',
					symLinkDest,
					'->',
					linkedTo,
				].join( ' ' ).yellow );
				rmMod = 'the link';
			} else {
				// Nothing for the user to do.
				needsToLink = needsToRm = false;
				snips.logger.user( ( 'They are already installed into SublimeText3 at "' + symLinkDest + '"' ).green );
			}
		} else {
			snips.logger.user( 'You already have snippets installed in SublimeText3.'.yellow );
			rmMod = 'the directory';
		}
	}

	if ( needsToRm ) {
		snips.logger.user( [
			( 'Remove ' + rmMod + ' with the following command:\n' ).grey,
			'$'.grey, ( 'rm -rf ' + '"' + symLinkDest + '"' ).blue
		].join( ' ' ) );
	}

	if ( needsToLink ) {
		snips.logger.user( [
			'To install them for SublimeText3, run the following command:\n'.grey,
			'$'.grey, ( 'ln -s ' + '"' + this.snippetDest + '" "' + symLinkDest + '"' ).blue
		].join( ' ' ) );
	}
};

/******************************************************************************
 *****     HELPERS    *********************************************************
 ******************************************************************************/

function insertSnippet( snippet, snippetDest ) {
	// Make sure the directory exists  (like mkdir -p)
	mkpath.sync( path.dirname( snippetDest ) );
	fs.writeFileSync( snippetDest, snippet.__content );
}
