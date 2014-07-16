var http = require('http');
var https = require('https');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var url = require('url');

http.createServer(function (req, res) {

	var url_parts = url.parse(req.url, true);
	query = url_parts.query;

	console.log(url_parts);
	//console.log(req);

	if(req.url === "/favicon.ico"){
		console.log("will try to proxy");
		res.end("no favicon");
	}
	else if(query["proxy"]){
		var bodyRequest = "";
		req.on("data", function(chunkRequest){
			//console.log("event data", chunkRequest);
			bodyRequest+=chunkRequest;
		});
		url_parts = url.parse(url_parts.search.substring(7), true);
		req.on("end", function(){
			//console.log("event end", url_parts, "fin");
			//var url_parts = url.parse(query["proxy"], true);
			//var url_parts = url_parts.search.substring(7);//.parse(query["proxy"], true);
			//console.log("url_parts", url_parts);
			var query = url_parts.query;		
			if(url_parts.protocol == "http:"){
				//console.log("is http: call", url_parts.protocol, url_parts.pathname);
				//console.log("query", query);
				//console.log("port will be",(url_parts.port != null ? url_parts.port : 80));
				//console.log("headers are", req.headers);
				var options = {
				  host: url_parts.hostname, 
				  port: (url_parts.port != null ? url_parts.port : 80),
				  path: url_parts.path,
				  method: req.method 
				};
				if(req.method=="POST"){
					options.headers = { "content-type": "application/json; charset=utf-8", "content-length": bodyRequest.length}; 
					//console.log("options for request are", options);
				}
				proxyBody = "";
				reqhttp = http.request(options, function(resProxy) {
				  //console.log('STATUS: ' + resProxy.statusCode);
				  //console.log('HEADERS: ' + JSON.stringify(resProxy.headers));
				  resProxy.setEncoding('utf8');
				  resProxy.on('data', function (chunk) {
				    proxyBody+=chunk;
				  });
				  resProxy.on('end', function () {
			            //console.log("end");
				    if(undefined == resProxy.headers['access-control-allow-origin']) resProxy.headers['access-control-allow-origin'] = '*';
				    if(undefined == resProxy.headers['access-control-allow-methods']) resProxy.headers['access-control-allow-methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
				    if(undefined == resProxy.headers['access-control-allow-headers']) resProxy.headers['access-control-allow-headers'] = 'Content-Type, Authorization, Content-Length, X-Requested-With';
				    res.writeHead(resProxy.statusCode, resProxy.headers);
				    res.end(proxyBody);
				  });
				});
				if(req.method=="POST"){
					//console.log("body to post is", bodyRequest);
					reqhttp.write(bodyRequest)
			 	}	
				reqhttp.end();
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
				};			

				if(req.method=="POST"){
					options.headers = { "content-type": "application/json; charset=utf-8", "content-length": bodyRequest.length}; 
					//console.log("options for request are", options);
				}


				proxyBody = "";
				reqhttps = https.request(options, function(resProxy) {
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
				});

				if(req.method=="POST"){
					//console.log("body to post is", bodyRequest);
					reqhttps.write(bodyRequest)
			 	}	
				reqhttps.end();
			}
			else {
				console.log("protocol Error");
				res.end("Error");
			}
		});
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

