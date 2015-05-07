var util = require( 'util' );
var Encoder = require( 'node-html-encoder' ).Encoder;
var encoder = new Encoder( 'entity' );
var snips = require( '../snips' );
var Translator = snips.proto.Translator;

module.exports = exports = DashTranslator;
util.inherits( DashTranslator, Translator );

var languageMap = {
	'JavaScript': 'JAVA_SCRIPT',
	'Java': 'JAVA'
};

function DashTranslator() {
	this.helpers = {
		v: function( variableName ) {
			return '$' + variableName + '$';
		},
		cursor: function() {
			return '$END$';
		}
	};
	Translator.call( this );
}

DashTranslator.prototype.translate = function( snippetData ) {

	var wrapperTmpl = [
		'<template name="{{__abbreviation}}" value="{{{___snippet}}}" description="{{__abbreviation}}" toReformat="false" toShortenFQNames="false">',
		'   {{#each __variables}}',
		'     <variable name="{{this}}" expression="completeSmart()" defaultValue="" alwaysStopAt="true" />',
		'   {{/each}}',
		'   <context>',
		'       <option name="HTML_TEXT" value="true" />',
		'       <option name="HTML" value="true" />',
		'       <option name="XSL_TEXT" value="true" />',
		'       <option name="XML" value="true" />',
		'       <option name="JSP" value="true" />',
		'       <option name="CSS_PROPERTY_VALUE" value="true" />',
		'       <option name="CSS_DECLARATION_BLOCK" value="true" />',
		'       <option name="CSS_RULESET_LIST" value="true" />',
		'       <option name="CSS" value="true" />',
		'       <option name="JAVA_SCRIPT" value="true" />',
		'       <option name="SQL" value="true" />',
		'       <option name="CUCUMBER_FEATURE_FILE" value="true" />',
		'       <option name="CoffeeScript" value="true" />',
		'       <option name="PHP" value="true" />',
		'       <option name="HAML" value="true" />',
		'       <option name="OTHER" value="true" />',
		'   </context>',
		'</template>'
	].join( '\n' );
	// phpstorm requires that `$` within templates is replaced with `$$`
	snippetData.__content.replace( /\$/g, '$$$$' );
	// Get the snippet body
	var rendered = this.handlebars.compile( snippetData.__content )();
	// Encode the content for the xml attribute
	rendered = encoder.htmlEncode( rendered );
	// Register some helpers so we can handlebars the wrapperTmpl (defined above)
	this.handlebars.registerHelper( '___snippet', rendered );
	// handlebars-ify the wrapperTmpl using snippetData as model
	var fullSnippet = this.handlebars.compile( wrapperTmpl )( snippetData );
	return fullSnippet;
};
