#!/usr/bin/env node

var mkpath = require( 'mkpath' );
var path = require( 'path' );
var fs = require( 'fs' );
var shell = require( 'shelljs' );
var program = require( 'commander' );
var snips = require( '..' );

program
	.description( 'Initialize a new snippets directory to ~/.snippets' )
	.option( '-f, --force', 'remove ~/.snippets directory first' )
	.option( '-b, --blank', 'initialize the directory with no contents' )
	.option( '-s, --sample', 'include the sample directory with the clone' )
	.parse( process.argv );

var snippets = path.join( process.env.HOME, '.snippets' );

var snippetsExists = fs.existsSync( snippets );

if ( snippetsExists && !program.force ) {
	snips.logger.user( ( '~/.snippets directory already exists' ).red );
	program.help();
} else {
	snips.logger.user( ( 'removed ~/.snippets' ).green );
	shell.rm( '-rf', snippets );
	snippetsExists = false;
}

mkpath.sync( snippets );
snips.logger.user( ( 'created ~/.snippets' ).green );

copySample( false );

snips.logger.user( ( 'Done.%s' ).green, program.clone ? ' Starting clone.' : '' );

/******************************************************************************
 *****     HELPERS    *********************************************************
 ******************************************************************************/
function copySample( requireSampleFlag ) {
	if ( program.blank || ( requireSampleFlag && !program.sample ) ) return;
	shell.config.silent = true;
	shell.cp( '-r', path.join( __dirname, '../snippets-sample/' ), path.join( snippets, 'sample/' ) );
	shell.config.silent = false;
	snips.logger.user( ( 'created ~/.snippets/sample/' ).green );
}
