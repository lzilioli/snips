var util = require( 'lz-node-utils' );
var path = require( 'path' );
var _ = require( 'underscore' );
var yamlfront = require( 'yaml-front-matter' ); // https://github.com/dworthen/js-yaml-front-matter

var snippets = path.join( process.env.HOME, '.snippets' );
var userSettings = util.loadAppSettings( undefined, path.join( snippets, 'settings.js' ) );

// TODO allow snippet blacklist in settings

module.exports = ( function() {

	var model = {};
	var tagIdByName = {};

	return {
		load: function( snippetSource, translator ) {

			// Error check up in here
			if ( !snippetSource ) {
				throw new Error( 'No snippetSource specified' );
			}
			if ( !translator ) {
				throw new Error( 'No translator specified.' );
			} else if ( !translator.translate ) {
				throw new Error( 'Expected translator to define a translate() function.' );
			} else if ( translator.translate && typeof translator.translate !== 'function' ) {
				throw new Error( 'Expected typeof translateFn === \'function\'' );
			}

			// Get all of the snippet files
			var snippetFiles = util.file.expand( snippetSource );

			model.snippets = _.map( snippetFiles, function( snippetPath, idx ) {
				// Read in the file
				var snippetContents = util.file.read( snippetPath );

				var snippetYamlDefaults = {
					// We reserve the __id and __filepath keys
					__id: idx + 1,
					__filepath: snippetPath,
					// Strictly speaking, the default language should
					// be determined by the translator. Its ok for now, dash
					// is the only exporter that uses this field currently.
					language: 'None',
					tags: []
				};

				// Grab the yaml front matter
				var snippetYaml = yamlfront.loadFront( snippetContents.trim() );

				// Reserve the __id key
				if ( !!snippetYaml.__id ) {
					throw new Error( '__id is a reserved key for snippets; in: ' + snippetPath );
				}
				// Reserve the __filepath key
				if ( !!snippetYaml.__filepath ) {
					throw new Error( '__filepath is a reserved key for snippets; in: ' + snippetPath );
				}
				// Reserve the __abbreviation key
				if ( !!snippetYaml.__abbreviation ) {
					throw new Error( '__abbreviation is a reserved key for snippets; in: ' + snippetPath );
				}

				// Get the final snippetData
				var snippetData = _.defaults( snippetYaml, snippetYamlDefaults );

				// Assign the abbreviation
				snippetData.__abbreviation = userSettings.snippetPrefix + path.basename( snippetPath, userSettings.snippetExtension ) + userSettings.snippetPostfix;

				// Determine all of the variables and add to snippetData
				var variableNames = [];
				var vRe = /\{{2,3}\S*v "([\w\d]*)"\S*\}{2,3}/g;
				var result = snippetData.__content.match( vRe );

				if ( result ) {
					for ( var i = 0; i < result.length; i++ ) {
						vRe.lastIndex = 0;
						variableNames.push( vRe.exec( result[ i ] )[ 1 ] );
					}
				}
				snippetData.__variables = _.uniq( variableNames );

				// Let the translator do its thing
				snippetData.__content = translator.translate( snippetData );

				// No newline for you (the yaml-front parsing adds one for some reaosn)
				if ( snippetData.__content[ 0 ] === '\n' ) {
					snippetData.__content = snippetData.__content.substr( 1 );
				}

				// If the translator defines a snipTeardown function call it now
				if ( translator && translator.snipTeardown ) {
					translator.snipTeardown();
				}

				// BOOM!
				return snippetData;

			} );

			// Get the tags out of the model
			model.tags = _.chain( model.snippets )
				// Get the tags from all of the snippets
				.map( function( d ) {
					return d.tags;
				} )
				// Flatten the resulting array
				.flatten()
				// Remove dupes, and sort
				.unique()
				.sort()
				// Turn each tag into an object with an id and a name
				.map( function( tag, idx ) {
					return {
						__id: idx + 1,
						name: tag
					};
				} )
				// Take this opportunity to build a map from tagname to id
				.tap( function( tags ) {
					_.each( tags, function( tag ) {
						tagIdByName[ tag.name ] = tag.__id;
					} );
				} )
				.value();

			return {
				data: model,
				getTagId: function( forTag ) {
					return tagIdByName[ forTag ];
				}
			};
		}
	};
}() );
