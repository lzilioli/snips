#!/usr/bin/env node

var fs = require( 'fs' );
var _ = require( 'underscore' );
var mkpath = require( 'mkpath' );
var path = require( 'path' );
var shell = require( 'shelljs' );
var extend = require( 'extend' );

var util = require( 'lz-node-utils' );
var fromLib = util.getReqFn( 'lib' );
var snips = fromLib( 'snips' );

var supportedFormats = [ 'dash', 'sublime' ];

// TODO export specify children and auto export to app
// TODO use commander
// TODO allow --all flag

var formats = ( snips.argv.apps || snips.argv.a );
if ( !formats ) {
	snips.logger.user(
		[
			'For what app(s)?'.yellow,
			'$'.grey,
			'grunt snip -a | --apps ['.blue,
			supportedFormats.join( ',' ).blue,
			']'.blue
		].join( ' ' ) );
	process.exit( 1 );
}

formats = _.map( formats.split( ',' ), function( format ) {
	format = format.trim();
	if ( !_.contains( supportedFormats, format ) ) {
		snips.logger.user( ( 'Unrecognized format: ' + format ).red );
		process.exit( 1 );
	}
	return format;
} );

var snippets = path.join( process.env.HOME, '.snippets' );
var snippetGlob = path.join( snippets, '**/*.snippet' );
var exportDir = path.join( snippets, 'export' );

shell.rm( '-rf', exportDir );
mkpath.sync( exportDir );

var commonConfig = {
	snippetSource: [
		snippetGlob,
		'!' + path.join( exportDir, '**' )
	]
};

var formatConfigMap = {
	'sublime': {
		translator: fromLib( 'sublime-translator' ),
		exporter: fromLib( 'sublime-exporter' ),
		snippetDest: path.join( exportDir, 'SublimeSnippets/' ),
		outputExtension: '.sublime-snippet',
		afterExport: function() {
			var symLinkDest = '~/Library/Application Support/Sublime Text 3/Packages/SublimeSnippets';
			var lnDest = '${HOME}/Library/Application Support/Sublime Text 3/Packages/SublimeSnippets';
			if ( !fs.existsSync( symLinkDest ) ) { // TODO Check that is symlink
				snips.logger.user( 'To install them for SublimeText3, run the following command:' );
				snips.logger.user( [
					'$'.grey,
					'ln -s'.blue, ( '"' + this.snippetDest + '"' ).blue, ( '"' + lnDest + '"' ).blue
				].join( ' ' ) );
			}
		}
	},
	'dash': {
		translator: fromLib( 'dash-translator' ),
		exporter: fromLib( 'dash-exporter' ),
		snippetDest: path.join( exportDir, '/Snippets.dash' ),
		afterExport: function() {
			// TODO Add config option to not perform import
			var result = shell.exec( 'open ' + this.snippetDest );
			if ( result.code !== 0 ) {
				snips.logger.user( 'An error occurred trying to load the Snippets into Dash.'.red );
				snips.logger.user( 'To install them for Dash, run the following command:' );
				snips.logger.user( [
					'$'.grey,
					'open'.blue,
					this.snippetDest.blue
				].join( ' ' ) );
				process.exit( 1 );
			} else {
				snips.logger.user( 'Successfully imported snippets into Dash.'.red );
			}
		}
	}
};

doExport();

function doExport() {
	var format = formats.pop();

	var formatCfg = formatConfigMap[ format ];
	if ( !formatCfg ) {
		throw new Error( 'Must specify a config for format: ' + format );
	}

	formatCfg = extend( {}, commonConfig, formatCfg );
	formatCfg.translator = new formatCfg.translator();
	formatCfg.exporter( formatCfg ).then( handleSuccess, handleError );

	function handleSuccess() {
		snips.logger.user( ( 'Done exporting ' + format + ' Snippets to ' + formatCfg.snippetDest ).green );
		formatCfg.afterExport.call( formatCfg );
		if ( formats.length ) {
			doExport();
		}
	}

	function handleError( e ) {
		snips.logger.user( ( 'An error occurred exporting ' + format ).red );
		snips.logger.user( e );
	}
}
