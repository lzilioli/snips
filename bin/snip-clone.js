#!/usr/bin/env node

var path = require( 'path' );
var shell = require( 'shelljs' );
var util = require( 'lz-node-utils' );
var fromLib = util.getReqFn( 'lib' );
var snips = fromLib( 'snips' );
var program = require( 'commander' );

program
	.description( 'Clone a repo into ~/.snippets' )
	.usage( '[options] <file>' )
	.parse( process.argv );

var snippets = path.join( process.env.HOME, '.snippets' );

// Check arguments
if ( !program.args.length && !program.clone ) {
	snips.logger.user( 'You must specify a url to clone.'.red );
	process.exit( 1 );
}

// Do they have git?, will exit if not
snips.helpers.gitCheck();

var wasSuccessful = performClone();

if ( wasSuccessful ) {
	snips.logger.user( ( 'Clone successful into ' + snippets + '/' ).green );
}

function performClone() {
	shell.cd( snippets );
	shell.config.silent = true;
	var cloneArguments = ( program.args ).join( ' ' );
	var result = shell.exec( 'git clone ' + cloneArguments );
	shell.config.silent = false;
	snips.logger.user( result.output.trim()[ result.code === 0 ? 'green' : 'yellow' ] );
	return result.code === 0;
}
