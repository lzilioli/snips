#!/usr/bin/env node

var program = require( 'commander' );

if ( !process.env.HOME ) {
	throw new Error( 'HOME environment variable not set' );
}

// TODO ensure snippet dir exists unless init is being invoked
// TODO add clone command
// TODO refactor to use some form of module pattern
// TODO add snip open command to open the snippet directory in finder

program
	.version( require( '../package.json' ).version )
	.command( 'init', 'Create ~/.snippets directory if it does not exist and initialize with sample snippets' )
	.command( 'export', 'Export your snippets in your desired format' )
	.parse( process.argv );

if ( process.argv.length < 3 ) program.help();
