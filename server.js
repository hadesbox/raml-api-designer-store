
var express = require('express'),
files = require('./routes/files'),
routes = require('./routes/');
 
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.logger('dev'));
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: '1234567890QWERTY'}));  
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
 
app.get('/files', checkAuth, files.findAll);
app.get('/files/:id', checkAuth, files.findById);
app.post('/files', checkAuth, files.addFile);
app.put('/files/:id', checkAuth, files.updateFile);
app.delete('/files/:id', checkAuth, files.deleteFile);
app.get('/', checkAuth, routes.index);

app.post('/login', function (req, res) {
  console.log("trying to login...", req.body);
  var post = req.body;
  if (post.login === 'john' && post.password === 'johnspassword') {
    console.log("session is", req.session);
    req.session.user_id = 12;
    res.redirect('/');
  } else {
    res.send('Bad username and user/pass');
  }
});

app.get('/logout', function (req, res) {
  delete req.session.user_id;
  res.redirect('/login');
});


app.listen(app.get("port"));
console.log('Listening on port 3000...');


function checkAuth(req, res, next) {
  if (!req.session || !req.session.user_id) {
    res.statusCode = 401;
    res.send({status:"error", message:"You are not authorized to view this page"});
  } else {
    next();
  }
}

