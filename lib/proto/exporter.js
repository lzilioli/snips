var util = require( 'util' );

function ExporterError( msg ) {
	Error.captureStackTrace( this );
	this.message = msg;
	this.name = 'ExporterError';
}

util.inherits( ExporterError, Error );

function Exporter() {

}

Exporter.error = ExporterError;

module.exports = exports = Exporter;
