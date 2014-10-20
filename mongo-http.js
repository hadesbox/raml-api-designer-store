var http = require('http');
var https = require('https');
var fs = require('fs');
var url = require('url');

var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, { auto_reconnect: true });

db = new Db('ramldb', server, {safe:true});

db.open(function(err, db) {
    if (!err) {
        console.log("Connected to 'ramldb' database");
        db.collection('files', {
            strict: true
        }, function(err, collection) {
            if (err) {
                console.log("The 'files' collection doesn't exist. Use POST to add RAML files...");
                populateDB();
            }
        });
    }
});

http.createServer(function (req, res) {

	//console.log("REQUEST URL IS", req.url);

	if(req.url === "/favicon.ico"){
		console.log("ignoring favicon");
		res.end("no favicon");
	}
	else if(req.url.substring(0, 7) == "/proxy/"){
		var bodyRequest = "";
		req.on("data", function(chunkRequest){
			//console.log("event data", chunkRequest);
			bodyRequest+=chunkRequest;
		});

		var url_parts = url.parse(req.url.substring(7), true);
		//console.log("URL PARTS ARE", url_parts);

		req.on("end", function(){
			//console.log("METHOD IS", req.method);
			//console.log("HEADERS IS", req.headers);
			if(url_parts.protocol == "http:"){
				var options = {
				  host: url_parts.hostname, 
				  port: (url_parts.port != null ? url_parts.port : 80),
				  path: url_parts.path,
				  method: req.method
				};
				//we include origin request headers!
				options.headers = {};
				for (key in req.headers) {
					//console.log(key, req.headers[key], key.substring(0,11));	
					if("x-forwarded" != key.substring(0,11) && key != 'referer' && key != 'host' && key != 'accept-encoding'){
						options.headers[key] = req.headers[key];
					}
				}
				proxyBody = "";
				reqhttp = http.request(options, function(resProxy) {
				  //console.log('STATUS RESPONSE: ' + resProxy.statusCode);
				  //console.log('HEADER RESPONSE: ' + JSON.stringify(resProxy.headers));
				  resProxy.setEncoding('utf8');
				  resProxy.on('data', function (chunk) {
				    proxyBody+=chunk;
				  });
				  resProxy.on('end', function () {
				    // console.log(proxyBody);
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
				  port: 443,
				  path: url_parts.pathname,
				  method: req.method,
				  rejectUnauthorized: false,
			      	  requestCert: true,
			      	  agent: false
				};			
				//we include origin request headers!
				options.headers = {};
				for (key in req.headers) {
					//console.log(key, req.headers[key], key.substring(0,11));	
					if("x-forwarded" != key.substring(0,11) && key != 'referer' && key != 'host' && key != 'accept-encoding'){
						options.headers[key] = req.headers[key];
					}
				}

/*
				if(req.method=="POST"){
					options.headers = { "content-type": "application/json; charset=utf-8", "content-length": bodyRequest.length}; 
				}
*/
				proxyBody = "";
				reqhttps = https.request(options, function(resProxy) {
				  //console.log('STATUS: ' + resProxy.statusCode);
				  //console.log('HEADERS: ' + JSON.stringify(resProxy.headers));
				  resProxy.setEncoding('utf8');
				  resProxy.on('data', function (chunk) {
				    proxyBody+=chunk;
				  });
				  resProxy.on('end', function (chunk) {
				    //console.log('terminado');
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
		//MongoClient.connect("mongodb://localhost:27017/ramldb", function(err, db) {
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
		//});		
	}

}).listen(10000);

console.log("Server listtening in port 10000");

