/*
Simple score server written in Node.js by Michael Waterworth 2012

Howto:
1: On posix compliant systems run sqlite3 scores.db
2: In interactive prompt
3: CREATE TABLE scores (name STRING, score NUMBER);
*/

var express = require('express'),
	http = require('http'),
	sqlite3 = require('sqlite3').verbose();

var app = express(),
	db = new sqlite3.Database('scores.db');//':memory:'

app.configure(function() {
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(express['static'](__dirname + '/'));//Grumble Grumble JSHint
	app.use(app.router);
});

var scoresView = function(req, res) {
	db.serialize(function() {
		db.all("SELECT name, score FROM scores order by score DESC limit 25", function(err, results) {
			if(err) throw err;
			if(!results){
				results = [];
			}
			res.send(results);
		});
	});
};

var scoresPost = function(req, res) {
	db.serialize(function() {
		var stmt = db.prepare("INSERT INTO scores (name, score) VALUES (?, ?)");
		stmt.run([req.body.name, req.body.score]);
		stmt.finalize();
		res.send(200,{});
	});
};

app.get('/scores', scoresView);
app.post('/scores', scoresPost);

app.listen(3000);