var mongo = require('mongodb');

var Server = mongo.Server,
  Db = mongo.Db,
  BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true, journal: true, safe:false});
db = new Db('ramldb', server, {safe:true});

db.open(function (err, db) {
  if (!err) {
    console.log("Connected to 'ramldb' database");
    db.collection('files', {strict: true}, function (err, collection) {
      if (err) {
        console.log("The 'files' collection doesn't exist. Use POST to add RAML files...");
        populateDB();
      }
    });
  }
});

exports.pong = function (req, res) {
  console.log(Date(), req.session.user_id, "pong!");
  res.send("pong!");
};

exports.findByProject = function (req, res) {

  console.log('Retrieving files for project: ' + req.params.id);

  if(req.params.id == 'undefined' || req.params.id  === null){
    res.httpStatus = 404;
    res.send(JSON.stringify({status: "error", response: "invalid or empty project id"}));
  }
  else{
    var projectid = req.params.id;
    var filelist = new Object();
    db.collection('files', function (err, collection) {
      query =  { project: projectid }
      collection.find(query, {path: 1, name:1, team:1, owner:1}, function (err, resultCursor) {
        resultCursor.each(function (err, item) {
          if (item != null) {
            //console.log('Item : ' + item._id + ' : ' + item.path);
            filelist[item._id] = item;
            delete filelist[item._id]._id;
            //console.log(JSON.stringify(filelist));
          }
          else {
            res.header("Access-Control-Allow-Origin", "*");
            res.send(JSON.stringify({status: "ok", response: filelist}));
          }
        });
      });
    });
  }

};

exports.findMyProjects = function (req, res) {
  console.log('Retrieving my projects:', req.session.user_id);
  db.collection('users', function (err, collection) {
    //console.log("collection", err, collection);
    collection.findOne({'_id': new BSON.ObjectID(req.session.user_id)}, function (err, item) {
      //console.log("found", item);
      delete item._id;
      delete item.team;
      delete item.admin;
      delete item.mail;
      delete item.pass;
      item.status="ok";
      res.header("Access-Control-Allow-Origin", "*");
      res.send(item);
    });
  });
};

exports.findById = function (req, res) {
  //console.log('Retrieving file: ' + req.params.id);
   if(req.params.id == 'undefined' || req.params.id  === null){
  	res.httpStatus = 404;
    res.send(JSON.stringify({status: "error", response: "invalid id"}));
  }
  else{
 	  var id = req.params.id;
 	  db.collection('files', function (err, collection) {
 	    collection.findOne({'_id': new BSON.ObjectID(id)}, function (err, item) {
 	      delete item._id;
 	      res.header("Access-Control-Allow-Origin", "*");
 	      res.send(item);
 	    });
 	  });
  }
};

exports.findAll = function (req, res) {
  var filelist = new Object();
  db.collection('files', function (err, collection) {
    if(req.session.admin){
      //if its admin we search for all documents in collection
      query = {};
    }
    else{
      //if its not, we search for owned and team share files
      query =  { $or: [ { "owner" : req.session.user_id }, { "team": req.session.team } ] }
    }
    collection.find(query, {path: 1, name:1, team:1, owner:1}, function (err, resultCursor) {

      resultCursor.each(function (err, item) {
        if (item != null) {
          //console.log('Item : ' + item._id + ' : ' + item.path);
          filelist[item._id] = item;
          delete filelist[item._id]._id;
          //console.log(JSON.stringify(filelist));
        }
        else {
          res.header("Access-Control-Allow-Origin", "*");
          res.send(JSON.stringify({status: "ok", response: filelist}));
        }
      });
    });
  });

};

exports.addFile = function (req, res) {
  var file = req.body;
  //console.log('Adding file : ' + JSON.stringify(file));
  file.owner = req.session.user_id;
  file.team = req.session.team;
  db.collection('files', function (err, collection) {
    collection.insert(file, {safe: true}, function (err, result) {
      if (err) {
        res.send({'error': 'An error has occurred'});
      } else {
        //console.log('Success: ' + JSON.stringify(result[0]));
        res.header("Access-Control-Allow-Origin", "*");
        res.send(result[0]);
      }
    });
  });
}

exports.updateFile = function (req, res) {
  var id = req.params.id;
  db.collection('files', function (err, collection) {
    collection.findOne({'_id': new BSON.ObjectID(id)}, function (err, item) {
      if(err){
        res.httpStatus = 404;
        res.send(JSON.stringify({status: "error", response: "Item not found."}));
      }
      else if(req.session.user_id != item.owner && req.session.team != item.team && !req.session.admin){
        res.httpStatus = 403;
        res.send(JSON.stringify({status: "error", response: "you dont have permissions to access that resouce."}));
      }
      else {
        item.content = req.body.content;
        if(item.team == null || item.team == ""){
          item.team = req.session.team; 
        }
        collection.update({'_id': new BSON.ObjectID(id)}, item, {safe: true}, function (err, result) {
          if (err) {
            //console.log('Error updating file : ' + err);
            res.send({'error': 'An error has occurred'});
          } else {
            //console.log('' + result + ' document(s) updated');
            res.header("Access-Control-Allow-Origin", "*");
            res.send('{"status":"success","id":"' + id + '","message":"The file was successfully updated."}');
          }
        });
      }
    });
  });
}

exports.deleteFile = function (req, res) {
  var id = req.params.id;
  //console.log('Deleting file: ' + id);
  db.collection('files', function (err, collection) {
    collection.findOne({'_id': new BSON.ObjectID(id)}, function (err, item) {
      if(err){
        res.httpStatus = 404;
        res.send(JSON.stringify({status: "error", response: "Item not found."}));
      }
      else if(req.session.user_id != item.owner && req.session.team != item.team && !req.session.admin){
        res.httpStatus = 403;
        res.send(JSON.stringify({status: "error", response: "you dont have permissions to access that resouce."}));
      }
      else {
        collection.remove({'_id': new BSON.ObjectID(id)}, {safe: true}, function (err, result) {
          if (err) {
            res.send({'error': 'An error has occurred - ' + err});
          } else {
            //console.log('' + result + ' document(s) deleted');
            res.send(req.body);
          }
        });
      }
    });
  });
}

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function () {

  var files = [
    {
      path: "/demo.raml",
      name: "demo.raml",
      content: "#%25RAML%200.8%0Atitle:"
    }
  ];

  db.collection('files', function (err, collection) {
    collection.insert(files, {safe: true}, function (err, result) {
    });
  });

};
