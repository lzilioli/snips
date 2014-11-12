var util = require( 'lz-node-utils' );
var _ = require( 'underscore' );
var yamlfront = require( 'yaml-front-matter' ); // https://github.com/dworthen/js-yaml-front-matter

module.exports = ( function() {

	var model = {};
	var tagIdByName = {};

	return {
		load: function() {
			var snippetFiles = util.file.expand( global.config.snippetSource );

			model.snippets = _.map( snippetFiles, function( snippetPath, idx ) {
				var snippetContents = util.file.read( snippetPath );
				var snippetData = yamlfront.loadFront( snippetContents.trim() );
				snippetData.__id = idx + 1;
				// TODO: Infer abbreviation from filepath, if none specified
				snippetData.abbreviation = global.config.abbreviationPrefix + snippetData.abbreviation;
				return snippetData;
			} );

			model.tags = _.chain( model.snippets )
				.map( function( d ) {
					return d.tags;
				} )
				.flatten()
				.unique()
				.sort()
				.map( function( tag, idx ) {
					return {
						__id: idx + 1,
						name: tag
					};
				} )
				.tap( function( tags ) {
					_.each( tags, function( tag ) {
						tagIdByName[ tag.name ] = tag.__id;
					} );
				} )
				.value();

			return model;
		},
		getTagId: function( forTag ) {
			return tagIdByName[ forTag ];
		}
	};
}() );
