module.exports = ( function() {

	var handlebars = require( 'handlebars' );

	var curTabIndex = 1;
	var tabIndices = {};

	var helpers = {
		v: function( variableName ) {
			if ( !tabIndices[ variableName ] ) {
				tabIndices[ variableName ] = curTabIndex++;
			}
			var varTabIdx = tabIndices[ variableName ];
			return '${' + varTabIdx + ':' + variableName + '}';
		},
		cursor: function() {
			return '$0';
		}
	};

	var wrapperTmpl = [
		// The translate function registers the ___snippet helper
		'<snippet><content><![CDATA[{{{ ___snippet }}}]]></content>',
		// abbreviation and description come from the snippetData
		'<tabTrigger>{{ abbreviation }}</tabTrigger>',
		'<description>{{ description }}</description>',
		// The translate function registers the ___scope helper (currently unused, commenting out)
		// '<scope>{{ ___scope }}</scope>',
		'</snippet>'
	].join( '\n' );

	return {
		translate: function( snippetData ) {
			// Register the static helpers defined above
			handlebars.helpers = helpers;
			// Get the snippet body
			var rendered = handlebars.compile( snippetData.__content )();
			// Register some helpers so we can handlebars the wrapperTmpl (defined above)
			handlebars.registerHelper( '___snippet', rendered );
			// Commented out until we support this
			// handlebars.registerHelper( '___scope', function() {
			// 	return getScope( snippetData.language );
			// } );
			// handlebars-ify the wrapperTmpl using snippetData as model
			var fullSnippet = handlebars.compile( wrapperTmpl )( snippetData );

			return fullSnippet;
		},
		snipTeardown: function() {
			curTabIndex = 1;
			tabIndices = {};
		}
	};
}() );
