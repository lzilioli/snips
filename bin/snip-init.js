#!/usr/bin/env node

var mkpath = require( 'mkpath' );
var path = require( 'path' );
var fs = require( 'fs' );
var shell = require( 'shelljs' );
var program = require( 'commander' );
var logger = require( '../lib/logger' );

program
	.version( require( '../package.json' ).version )
	.option( '-f, --force', 'Remove ~/.snippets directory first' )
	.parse( process.argv );

var goodToInit = true;
var snippets = path.join( process.env.HOME, '.snippets' );

if ( fs.existsSync( snippets ) ) {
	if ( program.force ) {
		shell.rm( '-rf', snippets );
	} else {
		goodToInit = false;
		logger.user( ( '~/.snippets directory already exists' ).blue );
		logger.user( ( 'snip init --force # to delete ~/.snippets and start fresh' ).grey );
	}
}

if ( goodToInit ) {
	mkpath.sync( snippets );
	shell.config.silent = true;
	shell.cp( '-r', path.join( __dirname, '../snippets-sample/' ), path.join( snippets, 'sample/' ) );
	shell.config.silent = false;
	logger.user( ( '~/.snippets directory initialized' ).green );
}
