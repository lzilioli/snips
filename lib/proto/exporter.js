var util = require( 'util' );
var path = require( 'path' );

function ExporterError( msg ) {
	Error.captureStackTrace( this );
	this.message = msg;
	this.name = 'ExporterError';
}

util.inherits( ExporterError, Error );

function Exporter( opts ) {
	this.snips = require( '../snips' );
	if ( !this.translator ) throw new ExporterError( 'No translator specified.' );
	if ( typeof this.name !== 'string' ) throw new ExporterError( 'No name specified.' );
	if ( typeof this.export !== 'function' ) throw new ExporterError( 'No export function specified.' );
	if ( !this.snippetDest ) throw new ExporterError( 'No snippetDest specified.' );
	this.snippetSource = [
		path.join( this.snips.dir, '**/*.snippet' ),
		'!' + path.join( this.snips.exportDir, '**' )
	];

	this.snippetData = this.snips.loader.load( this.snippetSource, this.translator );
}

Exporter.prototype.doExport = function() {
	this.export().then( handleSuccess.bind( this ), handleError.bind( this ) );

	function handleSuccess() {
		this.snips.logger.user( ( 'Done exporting ' + this.name + ' Snippets to ' + this.snippetDest ).green );
		this.afterExport();
	}

	function handleError( e ) {
		this.snips.logger.user( ( 'An error occurred exporting ' + this.name ).red );
		this.snips.logger.user( e );
	}
};

Exporter.error = ExporterError;

module.exports = exports = Exporter;
