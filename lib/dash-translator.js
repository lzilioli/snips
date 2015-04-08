var nodeUtil = require( 'util' );
var util = require( 'lz-node-utils' );
var Translator = require( './proto/translator' );

var userSettings = util.loadAppSettings();

module.exports = exports = DashTranslator;
nodeUtil.inherits( DashTranslator, Translator );

function DashTranslator() {
	this.helpers = {
		v: function( variableName ) {
			return userSettings.dashVarDelimiter + variableName + userSettings.dashVarDelimiter;
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
