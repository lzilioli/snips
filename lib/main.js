require( './globalConfig' );

var fs = require( 'fs' );
var _ = require( 'underscore' );
var sqlite3 = require( 'sqlite3' ).verbose();

var db = getDb();
var snippets = global.req( 'snippet-loader' );
var snippetData = snippets.load();

db.serialize( function() {

	_.each( snippetData.tags, function( tag ) {
		insertTag( db, tag );
	} );

	_.each( snippetData.snippets, function( snippet ) {
		insertSnippet( db, snippet );
		_.each( snippet.tags, function( tag ) {
			insertSnippetTagPair( db, snippet.__id, snippets.getTagId( tag ) );
		} );
	} );

} );


db.close();


/******************************************************************************
 *****     HELPERS    *********************************************************
 ******************************************************************************/

function getDb() {
	var dbPath = global.pth( global.config.exportFile );
	var dbExisted = fs.existsSync( dbPath );
	var db = new sqlite3.Database( dbPath );

	db.serialize( function() {
		initDb( db, dbExisted );
	} );

	return db;
}

function initDb( db, dropTables ) {

	if ( dropTables ) {
		db.run( 'DROP TABLE smartTags' );
		db.run( 'DROP TABLE snippets' );
		db.run( 'DROP TABLE tags' );
		db.run( 'DROP TABLE tagsIndex' );
	}
	db.run( 'CREATE TABLE smartTags(stid INTEGER PRIMARY KEY, name TEXT, query TEXT)' );
	db.run( 'CREATE TABLE snippets(sid INTEGER PRIMARY KEY, title TEXT, body TEXT, syntax VARCHAR(20), usageCount INTEGER, FOREIGN KEY(sid) REFERENCES tagsIndex(sid) ON DELETE CASCADE ON UPDATE CASCADE)' );
	db.run( 'CREATE TABLE tags(tid INTEGER PRIMARY KEY, tag TEXT UNIQUE, FOREIGN KEY(tid) REFERENCES tagsIndex(tid) ON DELETE CASCADE ON UPDATE CASCADE)' );
	db.run( 'CREATE TABLE tagsIndex(tid INTEGER, sid INTEGER)' );
}

function insertSnippet( db, snippet ) {
	var stmt = db.prepare( 'INSERT INTO `snippets` VALUES(?, ?, ?, ?, ?)' );
	stmt.run( snippet.__id, snippet.abbreviation, snippet.__content, snippet.language, 0 );
	stmt.finalize();
}

function insertTag( db, tag ) {
	var stmt = db.prepare( 'INSERT INTO `tags` VALUES(?, ?);' );
	stmt.run( tag.__id, tag.name );
	stmt.finalize();
}

function insertSnippetTagPair( db, tagId, snippetId ) {
	var stmt = db.prepare( 'INSERT INTO `tagsIndex` VALUES(?, ?);' );
	stmt.run( tagId, snippetId );
	stmt.finalize();
}
