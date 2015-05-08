var util = require( 'util' );
var Handlebars = require( 'handlebars' );

function TranslatorError( msg ) {
	Error.captureStackTrace( this );
	this.message = msg;
	this.name = 'TranslatorError';
}

util.inherits( TranslatorError, Error );

function Translator() {
	if ( !this.helpers ) throw new TranslatorError( 'Helpers must be defined' );
	if ( !this.helpers.v ) throw new TranslatorError( 'v helper must be defined' );
	if ( !this.helpers.cursor ) throw new TranslatorError( 'cursor helper must be defined' );
	if ( typeof this.translate !== 'function' ) throw new TranslatorError( 'translate function must be defined' );
	if ( this.snipTeardown && typeof this.snipTeardown !== 'function' ) throw new TranslatorError( 'snipTeardown is specified but not a function' );
	this.snipTeardown = this.snipTeardown || function() {}; // optional argument
	this.handlebars = Handlebars.create();
	this.handlebars.registerHelper( this.helpers );
}

Translator.error = TranslatorError;

module.exports = exports = Translator;
