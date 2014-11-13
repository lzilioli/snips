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
			return '';
		}
	};

	return {
		translate: function( opts ) {
			handlebars.helpers = helpers;
			return handlebars.compile( opts.contents )();
		},
		snipTeardown: function() {
			curTabIndex = 1;
			tabIndices = {};
		}
	};
}() );
