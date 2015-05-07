var Q = require( 'Q' );
var fs = require( 'fs' );
var util = require( 'util' );
var path = require( 'path' );
var _ = require( 'underscore' );
var shell = require( 'shelljs' );
var snips = require( '../snips' );
var Exporter = snips.proto.Exporter;

module.exports = exports = PhpStormExporter;
util.inherits( PhpStormExporter, Exporter );

function PhpStormExporter() {
	this.name = 'PHPStorm';
	var phpStormTranslator = require( '../translators/phpstorm' );
	this.translator = new phpStormTranslator();
	this.snippetDest = path.join( snips.exportDir, '/phpstorm/' );
	Exporter.call( this );
}

PhpStormExporter.prototype.export = function() {

	var deferred = Q.defer();

	var copiedDest = path.join( this.snippetDest, 'phpstorm' );
	shell.config.silent = true;
	shell.cp( '-r', path.join( snips.moduleRoot, 'misc/phpstorm' ), this.snippetDest );
	shell.config.silent = false;

	var exportStr = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<templateSet group="snips">'
	].join( '\n' );

	_.each( this.snippetData.data.snippets, function( snippet ) {
		exportStr += '\n' + snippet.__content;
	} );

	exportStr += '\n</templateSet>';

	var fileDest = path.join( this.snippetDest, 'phpstorm/templates/snips.xml' );
	fs.writeFileSync( fileDest, exportStr );

	shell.config.silent = true;
	shell.cd( copiedDest );
	shell.exec( 'zip -r ../settings.jar .' );
	shell.rm( '-rf', copiedDest );
	shell.config.silent = false;

	deferred.resolve( true );

	return deferred.promise;
};

PhpStormExporter.prototype.afterExport = function() {
	snips.logger.user( ( 'Import ' + path.join( this.snippetDest, 'settings.jar' ) + ' into PHPStorm using File > Import Settings...' ).blue );
};
