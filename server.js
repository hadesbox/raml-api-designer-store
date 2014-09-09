
var express = require('express'),
files = require('./routes/files'),
routes = require('./routes/');
 
var util = require('./api-designer/scripts/sha1.js');

var app = express();

var mongo = require('mongodb');

var Server = mongo.Server,
  Db = mongo.Db,
  BSON = mongo.BSONPure;

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.logger('dev'));
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  //app.use(express.session({secret: '1234567890QWERTY'}));
  app.use(express.session({secret: '1234567890QWERTY'}, {
    cookie: {
      path: '/',
      httpOnly: true,
      secure: false,
      maxAge: 8 * 60 * 60 * 1000
    },
    rolling: true
  }));
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  app.use(express.static(__dirname + '/api-designer'));
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

/**
 * ------
 * ROUTES
 * ------
 */
 
app.get('/ping', checkAuth, files.pong);
app.get('/files', checkAuth, files.findAll);
app.get('/files/:id', checkAuth, files.findById);
app.post('/files', checkAuth, files.addFile);
app.put('/files/:id', checkAuth, files.updateFile);
app.delete('/files/:id', checkAuth, files.deleteFile);
app.get('/', checkAuth, routes.index);

app.post('/login', function (req, res) {
  var post = req.body;
  db.collection('users', function (err, collection) {
      if(!post.login ||  !post.password)
        res.redirect("/login.html?user="+post.login+"&empty=");
      else
        collection.findOne({'mail': post.login}, function (err, item) {
          //res.header("Access-Control-Allow-Origin", "*");
          if(!item || err){
            res.redirect("/login.html?user="+post.login+"&badpass=");
          }
          else{
            hashedPass = util.Sha1.hash(post.password);
            if(hashedPass == item.pass){
              req.session.user_id = item._id
              req.session.admin = (item.admin===false || item.admin===true? item.admin : false);
              req.session.team = item.team;
              res.redirect("/");
            }
            else{
              res.redirect("/login.html?badpass=");  
            }          
          }
        });
  });
});

app.get('/logout', function (req, res) {
  delete req.session.user_id;
  res.redirect('/login.html');
});


app.listen(app.get("port"));
console.log('Listening on port 3000...');

require("./mongo-http.js")

function checkAuth(req, res, next) {
  if (!req.session || !req.session.user_id) {
    res.statusCode = 401;
    res.send({status:"error", message:"You are not authorized to view this page"});
  } else {
    next();
  }
}


