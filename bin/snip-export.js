#!/usr/bin/env node

var fs = require( 'fs' );
var _ = require( 'underscore' );
var mkpath = require( 'mkpath' );
var path = require( 'path' );
var shell = require( 'shelljs' );
var extend = require( 'extend' );

var util = require( 'lz-node-utils' );
var fromLib = util.getReqFn( 'lib' );
var argv = fromLib( 'args' );
var logger = fromLib( 'logger' );

var supportedFormats = [ 'dash', 'sublime' ];

var formats = ( argv.format || argv.f );
if ( !formats ) {
	logger.user( 'An export format is required. Run with -f or --format followed by a comma separated list of desired export formats.' );
	process.exit( 1 );
}

formats = _.map( formats.split( ',' ), function( format ) {
	format = format.trim();
	if ( !_.contains( supportedFormats, format ) ) {
		logger.user( ( 'Unrecognized format: ' + format ).red );
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
		translator: fromLib( 'text-mate-translator' ),
		exporter: fromLib( 'text-mate-exporter' ),
		snippetDest: path.join( exportDir, 'SublimeSnippets/' ),
		outputExtension: '.sublime-snippet',
		afterExport: function() {
			var symLinkDest = '~/Library/Application Support/Sublime Text 3/Packages/SublimeSnippets';
			if ( !fs.existsSync( symLinkDest ) ) { // TODO: Check that is symlink
				logger.user( 'To install them for SublimeText3, run the following command:' );
				logger.user( [
					'$'.grey,
					'ln -s'.blue,
					this.snippetDest.blue,
					symLinkDest.blue
				].join( ' ' ) );
			}
		}
	},
	'dash': {
		translator: fromLib( 'dash-translator' ),
		exporter: fromLib( 'dash-exporter' ),
		snippetDest: path.join( exportDir, '/Snippets.dash' ),
		afterExport: function() {
			logger.user( 'To install them for Dash, run the following command:' );
			logger.user( [
				'$'.grey,
				'open'.blue,
				this.snippetDest.blue
			].join( ' ' ) );
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
	formatCfg.translator = formatCfg.translator( formatCfg );
	formatCfg.exporter( formatCfg ).then( handleSuccess, handleError );

	function handleSuccess() {
		logger.user( ( 'Done exporting ' + format + ' Snippets to ' + formatCfg.snippetDest ).green );
		formatCfg.afterExport.call( formatCfg );
		if ( formats.length ) doExport();
	}

	function handleError( e ) {
		logger.user( ( 'An error occurred exporting ' + format ).red );
		logger.user( e );
	}
}
