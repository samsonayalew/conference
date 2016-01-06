//email send module for node.js
var fs = require('fs');
var util = require('util');
var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var multer = require('multer');
var nodemailer = require('nodemailer');
var upload = multer({ dest: 'uploads/' });
var images = multer({dest: 'news_images/'});

var MongoClient = require('mongodb').MongoClient;
var connString = 'mongodb://localhost:27017/conference';
var router = express.Router();
/* GET users listing. */

router.get('/assignpaper', function(req, res, next){
  MongoClient.connect(connString, function(err, db){
    var users = db.collection('users');
    users.find({}).toArray(function(err, users){
      if(err) throw err;

      var arrWriter = users.filter(function(user){
        return (user.role === 'writer');
      });

      var arrReviewer = users.filter(function(user){
        return (user.role === 'reviewer');
      });

    if(req.session.authStatus && req.session.role === 'coordinator'){
      db.close();
      res.render('coordinator/assignpaper', { title: 'Conference | assign paper', 'reviewers':arrReviewer, 'files': arrWriter[0].file,'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
    } else {
      res.redirect('404');
    }
  });
  });
});

router.post('/selectionchange', function(req, res, next){
  res.end();
  console.log(util.inspect(req.body));
});

module.exports = router;
