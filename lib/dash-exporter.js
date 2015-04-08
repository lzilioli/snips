var _ = require( 'underscore' );
var Q = require( 'Q' );
var fs = require( 'fs' );
var path = require( 'path' );
var mkpath = require( 'mkpath' );
var sqlite3 = require( 'sqlite3' ).verbose();

var util = require( 'lz-node-utils' );
var fromLib = util.getReqFn( 'lib' );
var snippetLoader = fromLib( 'snippet-loader' );

module.exports = function( opts ) {
	var deferred = Q.defer();

	var snippetData = snippetLoader.load( opts );

	if ( !opts.snippetDest ) {
		throw new Error( 'No snippetDest specified' );
	}

	// Get an instance of the DB
	var db = getDb( opts.snippetDest );

	// Insert the things
	db.serialize( function() {
		_.each( snippetData.tags, function( tag ) {
			insertTag( db, tag );
		} );
		_.each( snippetData.snippets, function( snippet ) {
			insertSnippet( db, snippet );
			_.each( snippet.tags, function( tag ) {
				insertSnippetTagPair( db, snippet.__id, snippetLoader.getTagId( tag ) );
			} );
		} );
	} );

	// Close the DB
	db.close( function() {
		deferred.resolve( true );
	} );

	return deferred.promise;
};

/******************************************************************************
 *****     HELPERS    *********************************************************
 ******************************************************************************/

/**
 * Given a desired path to a sqLite DB, return a DB object pointing to a DB at
 * that path.
 *
 * @param  {String} DBPath		Relative path (from project root) at which
 *								to create the DB.
 * @return {Object}				sqlite3.Database object for a new DB at DBPath
 */
function getDb( dbPath ) {
	// Determine if it was already there
	var dbExisted = fs.existsSync( dbPath );
	// Make sure directories up to the DB exist (like mkdir -p)
	mkpath.sync( path.dirname( dbPath ) );
	// Instantiate the DB
	var db = new sqlite3.Database( dbPath );
	// Create the tables
	db.serialize( function() {
		// If it existed, drop its tables before recreating them
		if ( dbExisted ) {
			db.run( 'DROP TABLE smartTags' );
			db.run( 'DROP TABLE snippets' );
			db.run( 'DROP TABLE tags' );
			db.run( 'DROP TABLE tagsIndex' );
		}
		// Create the tables
		db.run( 'CREATE TABLE smartTags(stid INTEGER PRIMARY KEY, name TEXT, query TEXT)' );
		db.run( 'CREATE TABLE snippets(sid INTEGER PRIMARY KEY, title TEXT, body TEXT, syntax VARCHAR(20), usageCount INTEGER, FOREIGN KEY(sid) REFERENCES tagsIndex(sid) ON DELETE CASCADE ON UPDATE CASCADE)' );
		db.run( 'CREATE TABLE tags(tid INTEGER PRIMARY KEY, tag TEXT UNIQUE, FOREIGN KEY(tid) REFERENCES tagsIndex(tid) ON DELETE CASCADE ON UPDATE CASCADE)' );
		db.run( 'CREATE TABLE tagsIndex(tid INTEGER, sid INTEGER)' );
	} );
	return db;
}

function insertSnippet( db, snippet ) {
	var stmt = db.prepare( 'INSERT INTO `snippets` VALUES(?, ?, ?, ?, ?)' );
	stmt.run( snippet.__id, snippet.__abbreviation, snippet.__content, snippet.language, 0 );
	stmt.finalize();
}

function insertTag( db, tag ) {
	var stmt = db.prepare( 'INSERT INTO `tags` VALUES(?, ?);' );
	stmt.run( tag.__id, tag.name );
	stmt.finalize();
}

function insertSnippetTagPair( db, snippetId, tagId ) {
	var stmt = db.prepare( 'INSERT INTO `tagsIndex` VALUES(?, ?);' );
	stmt.run( tagId, snippetId );
	stmt.finalize();
}
