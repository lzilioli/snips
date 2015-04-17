var util = require( 'util' );
var snips = require( '../snips' );
var Translator = snips.proto.Translator;

module.exports = exports = DashTranslator;
util.inherits( DashTranslator, Translator );

function DashTranslator() {
	this.helpers = {
		v: function( variableName ) {
			return snips.settings.dashVarDelimiter + variableName + snips.settings.dashVarDelimiter;
		},
		cursor: function() {
			return '@cursor';
		}
	};
	Translator.call( this );
}

DashTranslator.prototype.translate = function( snippetData ) {
	return this.handlebars.compile( snippetData.__content )();
};
