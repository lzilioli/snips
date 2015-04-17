var util = require( 'util' );
var Translator = require( './proto/translator' );

module.exports = exports = SublimeTranslator;
util.inherits( SublimeTranslator, Translator );

function SublimeTranslator() {

	var myself = this;

	cleanState.apply( myself );

	this.helpers = {
		// TODO Support more of these features: http://sublimetext.info/docs/en/extensibility/snippets.html
		v: function( variableName ) {
			if ( !myself.state.tabIndices[ variableName ] ) {
				myself.state.tabIndices[ variableName ] = myself.state.curTabIndex++;
			}
			var varTabIdx = myself.state.tabIndices[ variableName ];
			return '${' + varTabIdx + ':' + variableName + '}';
		},
		cursor: function() {
			return '$0';
		}
	};

	Translator.call( myself );
}

function cleanState() {
	this.state = {
		curTabIndex: 1,
		tabIndices: {}
	};
}

SublimeTranslator.prototype.translate = function( snippetData ) {
	var wrapperTmpl = [
		// The translate function registers the ___snippet helper
		'<snippet><content><![CDATA[{{{ ___snippet }}}]]></content>',
		// __abbreviation comes from the snippetData
		'<tabTrigger>{{{ __abbreviation }}}</tabTrigger>',
		// This could be in the YAML front matter
		'<description>{{ description }}</description>',
		// This scope will make these snippets available globally in sublime
		'<scope>source, text</scope>',
		'</snippet>'
	].join( '\n' );
	// Get the snippet body
	var rendered = this.handlebars.compile( snippetData.__content )();
	// Register some helpers so we can handlebars the wrapperTmpl (defined above)
	this.handlebars.registerHelper( '___snippet', rendered );
	// handlebars-ify the wrapperTmpl using snippetData as model
	var fullSnippet = this.handlebars.compile( wrapperTmpl )( snippetData );
	return fullSnippet;
};

SublimeTranslator.prototype.snipTeardown = cleanState.bind( this );
