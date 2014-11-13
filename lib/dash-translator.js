var _ = require( 'underscore' );

module.exports = function( opts ) {

	opts = _.defaults( ( opts || {} ), {
		varDelimiter: '__'
	} );

	var handlebars = require( 'handlebars' );

	var helpers = {
		v: function( variableName ) {
			return opts.varDelimiter + variableName + opts.varDelimiter;
		},
		cursor: function() {
			return '@cursor';
		}
	};

	return {
		translate: function( opts ) {
			handlebars.helpers = helpers;
			return handlebars.compile( opts.contents )();
		}
	};
};
