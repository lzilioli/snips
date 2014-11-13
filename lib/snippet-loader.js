var util = require( 'lz-node-utils' );
var _ = require( 'underscore' );
var yamlfront = require( 'yaml-front-matter' ); // https://github.com/dworthen/js-yaml-front-matter

module.exports = ( function() {

	var model = {};
	var tagIdByName = {};

	return {
		load: function( config ) {

			if ( !config ) {
				throw new Error( 'No config specified' );
			} else if ( !config.snippetSource ) {
				throw new Error( 'No snippetSource specified' );
			}

			var snippetFiles = util.file.expand( config.snippetSource );

			model.snippets = _.map( snippetFiles, function( snippetPath, idx ) {
				var snippetContents = util.file.read( snippetPath );
				var snippetDefaults = {
					__id: idx + 1,
					abbreviation: '',
					language: 'None',
					tags: []
				};
				var snippetYaml = yamlfront.loadFront( snippetContents.trim() );
				var snippetData = _.defaults( snippetYaml, snippetDefaults );
				if ( snippetData.abbreviation && snippetData.abbreviation.length ) {
					snippetData.abbreviation = config.abbreviationPrefix + snippetData.abbreviation;
				} else {
					snippetData.abbreviation = '';
				}
				if ( config.translator ) {
					if ( config.translator.translate && typeof config.translator.translate !== 'function' ) {
						throw new Error( 'Expected typeof translateFn === \'function\'' );
					}
					snippetData.__content = config.translator.translate( {
						contents: snippetData.__content
					} );
				}
				snippetData.__filepath = snippetPath;
				// call between snippets so he can clean up
				config.translator.snipTeardown ? config.translator.snipTeardown() : _.noop();
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
