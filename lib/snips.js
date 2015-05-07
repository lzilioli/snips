var path = require( 'path' );
var fs = require( 'fs' );
var logger = require( './util/logger' );
var shell = require( 'shelljs' );
var lzUtil = require( 'lz-node-utils' );

if ( !process.env.HOME ) {
	throw new Error( 'HOME environment variable not set' );
}

var snippets = path.join( process.env.HOME, '.snippets' );

var Snips = module.exports = exports = {
	proto: {
		Translator: require( './proto/translator' ),
		Exporter: require( './proto/exporter' )
	},
	helpers: require( './util/helpers' ),
	cli: require( './util/snip-cli' ),
	argv: require( './util/argv' ),
	logger: logger,
	loader: require( './util/snippet-loader' ),
	dir: snippets,
	moduleRoot: path.join( __dirname, '..' ),
	exportDir: path.join( snippets, 'export' ),
	settings: lzUtil.loadAppSettings( undefined, path.join( snippets, 'settings.js' ) ),
	exists: function() {
		return fs.existsSync( snippets );
	}.bind( this ),
	reveal: function() {
		shell.config.silent = true;
		var cmdAThing = shell.exec( 'which ' + Snips.settings.revealCmd ).code === 0;
		if ( cmdAThing ) shell.exec( Snips.settings.revealCmd + ' ' + snippets );
		else Snips.logger.user( 'Command not found: %s'.red, Snips.settings.revealCmd );
		shell.config.silent = false;
	}.bind( this )
};
