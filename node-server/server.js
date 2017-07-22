var express = require('express');
var mongoose = require('mongoose');
// database will contain information from multiple feeds
var methodOverride = require('method-override');
var port = process.env.PORT || 3009;
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var xmlparser = require('express-xml-bodyparser');
var routes = require('./app/routes');

var app = express();
var router = express.Router();

// Just some options for the db connection
var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } }};

mongoose.connect('mongodb://localhost:27017/', options);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

//Log with Morgan 
app.use(morgan('dev'));
//parse application/json and look for raw text
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json'}));
app.use(xmlparser());

routes(router);
app.use('/v1.0/api',router);

// [SH] Catch unauthorised errors
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({"message" : err.name + ": " + err.message});
  }
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
}); 

app.listen(port);
console.log('listening on port ' + port);
               