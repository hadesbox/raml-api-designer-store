var http = require('http');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

http.createServer(function (req, res) {
  console.log("looking for file", req.url);
  MongoClient.connect("mongodb://localhost:27017/ramldb", function(err, db) {
	  db.collection('files', function (err, collection) {
	    collection.findOne({'path': req.url}, function (err, item) {
	      if(!item || err){
	        res.writeHead(400, {'Content-Type': 'text/plain'});
	        res.end("Element not found");
	      }
	      else{
	        res.writeHead(200, {'Content-Type': 'text/plain'});
	        res.end(unescape(item.content));
	      }          
	    });
	  });
  });
}).listen(10000);

console.log("Server listtening in port 10000");