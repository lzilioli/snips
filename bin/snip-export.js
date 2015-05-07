#!/usr/bin/env node

var _ = require( 'underscore' );
var mkpath = require( 'mkpath' );
var path = require( 'path' );
var snips = require( '../lib/snips' );

var supportedFormats = [ 'dash', 'sublime' ];

var help = snips.argv.h || snips.argv.help;
var formats = snips.argv.apps;

if ( snips.argv.all ) {
	formats = supportedFormats.join( ',' );
}

if ( help || !formats ) {
	snips.logger.user( [
		'For what app(s)?\n'.yellow,
		'$'.grey,
		'snip export --all'.blue,
		'\nOR\n'.yellow,
		'$'.grey,
		'snip export --apps ['.blue,
		supportedFormats.join( ',' ).blue,
		']'.blue
	].join( ' ' ) );
	process.exit( help ? 0 : 1 );
}

formats = _.map( formats.split( ',' ), function( format ) {
	format = format.trim();
	if ( !_.contains( supportedFormats, format ) ) {
		snips.logger.user( ( 'Unrecognized format: ' + format ).red );
		process.exit( 1 );
	}
	return format;
} );

mkpath.sync( snips.exportDir );

_.each( formats, function( format ) {
	var modulePath = path.join( '../lib/exporters', format );
	var module = require( modulePath );
	var instance = new module();
	instance.doExport();
} );
