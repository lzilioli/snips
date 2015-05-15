#!/usr/bin/env node

var path = require( 'path' );
var shell = require( 'shelljs' );
var fs = require( 'fs' );
var program = require( 'commander' );

var lzUtil = require( 'lz-node-utils' );
var fromLib = lzUtil.getReqFn( 'lib' );
var snips = fromLib( 'snips' );

var defaultConfig = path.join( __dirname, '../config/default-settings.js' );
var snipConfig = path.join( snips.dir, 'settings.js' );

program
	.description( 'Initializes a settings.js file in your snippets directory for customization.' )
	.option( '-r, --rm', 'remove your settings.js, if it exists' )
	.option( '-e, --edit', 'edit the file before the process exits' )
	.parse( process.argv );

var exists = fs.existsSync( snipConfig );
if ( exists && program.rm ) {
	snips.logger.user( 'Removing settings file %s.'.green, snipConfig.blue );
	shell.rm( snipConfig );
	exists = false;
}

if ( !exists ) {
	snips.logger.user( 'Initializing settings file.'.green );
	shell.cp( defaultConfig, snipConfig );
}

if ( program.edit && process.env.EDITOR ) {
	snips.logger.user( 'Editing snippets file.'.green );
	shell.exec( '$EDITOR ' + snipConfig );
} else {
	snips.logger.user( '%sYou can edit the file: %s'.green,
		exists ? 'Nothing to do. ' : '',
		snipConfig.blue );
}
