var http = require('http');
var https = require('https');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var url = require('url');

http.createServer(function (req, res) {

	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

	//console.log(url_parts);
	//console.log(req);

	if(req.url === "/favicon.ico"){
		console.log("will try to proxy");
		res.end("no favicon");
	}
	else if(query["proxy"]){
		var url_parts = url.parse(query["proxy"], true);
		var query = url_parts.query;		
		if(url_parts.protocol == "http:"){
			console.log("is http: call", url_parts.protocol, url_parts.pathname);
			/*			
			console.log("parts", url_parts);
			console.log("query", query);
			console.log("port will be",(url_parts.port != null ? url_parts.port : 80));
			*/
			var options = {
			  host: url_parts.hostname, 
			  port: (url_parts.port != null ? url_parts.port : 80),
			  path: url_parts.pathname,
			  method: req.method
			};
			proxyBody = "";
			http.request(options, function(resProxy) {
			  //console.log('STATUS: ' + resProxy.statusCode);
			  //console.log('HEADERS: ' + JSON.stringify(resProxy.headers));
			  resProxy.setEncoding('utf8');
			  resProxy.on('data', function (chunk) {
			    proxyBody+=chunk;
			  });
			  resProxy.on('end', function (chunk) {
			    console.log('terminado');
			    resProxy.headers['Access-Control-Allow-Origin'] = '*';
			    resProxy.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
			    resProxy.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Content-Length, X-Requested-With';
			    //console.log(resProxy.headers);
				res.writeHead(resProxy.statusCode, resProxy.headers);
			    res.end(proxyBody);
			  });
			}).end();
		}
		else if(url_parts.protocol == "https:"){
			var options = {
			  host: url_parts.hostname, 
			  port: (url_parts.port != null ? url_parts.port : 80),
			  path: url_parts.pathname,
			  method: req.method,
			  rejectUnauthorized: false,
		      requestCert: true,
		      agent: false
			}			
			proxyBody = "";
			https.request(options, function(resProxy) {
			  //console.log('STATUS: ' + resProxy.statusCode);
			  //console.log('HEADERS: ' + JSON.stringify(resProxy.headers));
			  resProxy.setEncoding('utf8');
			  resProxy.on('data', function (chunk) {
			    proxyBody+=chunk;
			  });
			  resProxy.on('end', function (chunk) {
			    console.log('terminado');
			    resProxy.headers['Access-Control-Allow-Origin'] = '*';
			    resProxy.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
			    resProxy.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Content-Length, X-Requested-With';
			    //console.log(resProxy.headers);
				res.writeHead(resProxy.statusCode, resProxy.headers);
			    res.end(proxyBody);
			  });
			}).end();

		}
		else {
			console.log("protocol Error");
			res.end("Error");
		}
		//retailerpromotions-dev.elasticbeanstalk.com/groups
	}
	else{
		console.log("looking for file", req.url);
		MongoClient.connect("mongodb://localhost:27017/ramldb", function(err, db) {
			db.collection('files', function (err, collection) {
				collection.findOne({'path': req.url}, function (err, item) {
					if(!item || err){
						res.writeHead(400, {'Content-Type': 'text/plain'});
						res.end("Element not found");
					}
					else{
						res.writeHead(200, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS', 'Access-Control-Allow-Headers':'Content-Type, Authorization, Content-Length, X-Requested-With'});
						res.end(unescape(item.content));
					}          
				});
			});
		});		
	}

}).listen(10000);

console.log("Server listtening in port 10000");

