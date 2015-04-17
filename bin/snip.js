#!/usr/bin/env node

var path = require( 'path' );
process.chdir( path.join( __dirname, '..' ) );

var _ = require( 'underscore' );
var snips = require( '../lib/snips' );

var wantsHelp = snips.argv.h || snips.argv.help;

if ( wantsHelp || process.argv.length < 3 ) {
	help();
	process.exit( 1 );
}

var desiredCommand = process.argv[ 2 ];

// Enforce that some tasks require ~/.snippets to exist.
if ( _.contains( [ 'export', 'clone', 'reveal', 'config', 'd', 'dir' ], desiredCommand ) && !snips.exists() ) {
	snips.logger.user( 'No snippets directory exists. First run `snip init`.'.green );
	process.exit( 1 );
}

switch ( desiredCommand ) {
	case 'init':
		snips.cli( 'init' );
		break;
	case 'export':
		snips.cli( 'export' );
		break;
	case 'clone':
		snips.cli( 'clone' );
		break;
	case 'config':
		snips.cli( 'config' );
		break;
	case 'reveal':
		if ( wantsHelp ) {
			console.log( [
				'Usage: snip reveal',
				'', 'Runs the open command in your shell using your snippets directory as an argument.',
				'You can customize the open command by running `snip config`. See the revealCmd.'
			].join( '\n  ' ) );
		} else {
			snips.reveal();
		}
		break;
	case 'dir':
	case 'd':
		if ( wantsHelp ) {
			console.log( [
				'Usage: snip ' + desiredCommand,
				'', 'Prints the path to ~/.snippets. Useful for stuff like:',
				'  cd $(snip d)',
				'  pushd $(snip dir)'
			].join( '\n  ' ) );
		} else {
			console.log( snips.dir );
		}
		break;
	default:
		snips.logger.user( ( 'Unrecognized command: ' + desiredCommand ).yellow );
		help();
		break;
}

function help() {
	var descMap = {
		'init  ': 'create ~/.snippets directory if it does not exist and initialize with sample snippets',
		'export': 'export your snippets in your desired format',
		'clone ': 'clone a new repo into your snippets',
		'reveal': 'open ~/.snippets in your OS\'s default application',
		'config': 'configure settings for ~/.snippets',
		'dir   ': 'print the snippets directory to the command line (alias: d)'
	};
	console.log( 'snips' );
	console.log( '=====' );
	console.log( '\nShare and port your snippets between multiple tools.\n' );
	_.each( descMap, function( val, key ) {
		console.log( '   %s   %s', key, val );
	} );
	console.log( '\nRun any of the above commands with --help for more info.\n' );
}
