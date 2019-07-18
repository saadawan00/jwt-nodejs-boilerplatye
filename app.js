const express = require ('express');
const jwt = require ('jsonwebtoken');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('./config/database'); 
const movies = require('./routes/movies') ;
const users = require('./routes/users');

const app = express();

///-------------------------------movies tutorial

app.set('secretKey', 'nodeRestApi'); // jwt secret token
// connection to mongodb
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));

app.get('/',(req,res) => {
    res.json({"tutorial" : "Build REST API with node.js"});
})


// public route
app.use('/users', users);
// private route
app.use('/movies', validateUser, movies);
app.get('/favicon.ico', function(req, res) {
    res.sendStatus(204);
});
function validateUser(req, res, next) {
  jwt.verify(req.headers['x-access-token'], req.app.get('secretKey'), function(err, decoded) {
    if (err) {
      res.json({status:"error", message: err.message, data:null});
    }else{
      // add user id to request
      req.body.userId = decoded.id;
      next();
    }
  });
  
}
// express doesn't consider not found 404 as an error so we need to handle 404 explicitly
// handle 404 error
app.use(function(req, res, next) {
 let err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// handle errors
app.use(function(err, req, res, next) {
 console.log(err);
 
  if(err.status === 404)
   res.status(404).json({message: "Not found"});
  else 
    res.status(500).json({message: "Something looks wrong :( !!!"});
});



////////------------------------------------------------
app.get('/api', (req,res) => {
    res.json({
        message: 'Welcome to the API'
    });
});

app.post('/api/posts', verifyToken, (req,res) => {
    jwt.verify(req.token, 'secretkey', (err,authData) => {
      if(err){
          res.sendStatus(403)
          console.log(err)
      }  else {
        res.json({
            message: 'Post created',
            authData
        });
      }
    });
   
});
app.post('/api/login', (req,res) => {
//Mock User
const user = {
    id:1,
    username: 'test',
    email: 'test@gmail.com'
}

    jwt.sign({user}, 'secretkey', (err,token) => {
        res.json({
            token
        })
    });
})

//FORMAT OF TOKEN
//Authorization: Bearer <access_token>

//Verify Token
function verifyToken(req,res,next){
    //Get auth header value
    const bearerHeader = req.headers['authorization'];
    console.log("bearerHeader", bearerHeader)
    //Check if bearer is undefined
    if(typeof bearerHeader !== 'undefined'){
        //Split at the space
        const bearer = bearerHeader.split(' ');
        //Get token from array
        const bearerToken = bearer[1]
        //Set the token
        req.token = bearerToken;
        //Next middleware
        next();
    } else{
        //Forbidden
        res.sendStatus(403)
    }

}


app.listen(5000,()=> console.log('Server started on 5000'))