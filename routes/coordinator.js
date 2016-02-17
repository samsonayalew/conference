//email send module for node.js
var fs = require('fs');
var util = require('util');
var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var multer = require('multer');
var path = require('path');
var nodemailer = require('nodemailer');
var upload = multer({ dest: 'uploads/' });
var images = multer({dest: 'news_images/'});

var MongoClient = require('mongodb').MongoClient;
var connString = 'mongodb://localhost:27017/conference';
var router = express.Router();
/* GET users listing. */

router.get('/downloadpaper', function(req, res, next){
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
      var track = db.collection('track');
      track.find({coordinator: req.session.email}).toArray(function(err, track){
        if(err) throw err;
        if(req.session.authStatus && req.session.role === 'coordinator'){
          db.close();
          res.render('coordinator/downloadpaper', { title: 'Conference | download paper','track':track[0], 'reviewers':arrReviewer, 'writers': arrWriter,'username': req.session.firstname, 'role': req.session.role, 'authStatus':'loggedIn'});
        } else {
          res.redirect('404');
        }
    });
  });
  });
});

router.get('/papers/:file', function(req, res, next){
  MongoClient.connect(connString, function(err, db){
    if(err) throw err;
    var users = db.collection('users');
    if(req.params.file){
      var doc = req.params.file;
      users.find({'file.originalname': doc}, {'file.$':1}).toArray(function(err, doc){
        //  var path = path.resolve(__dirname + '../uploads/' + doc[0].file[0].filename);
         //
        //  res.attachment(path);
        if(doc[0].file[0].filename){
          //res.attachment(path.resolve('./uploads/' + doc[0].file[0].filename));
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader("Content-Disposition", "attachment");
          res.download(path.resolve('./uploads/' + doc[0].file[0].filename), doc[0].file[0].originalname);
       }else{
         res.status(400).redirect('/submit');
       }
      });
    }else{
      res.status(400).redirect('/submit');
    }
  });
});

router.get('/swiftverify', function(req, res, next){
  MongoClient.connect(connString, function(err, db){
    if(err) throw err;
    var users = db.collection('col');
    users.find({}).toArray(function(err, users){
      if(users.length > 0){
        if(req.session.role === 'coordinator'){
          var users = users.map(function(item, index){
            if(item.code)
            return [item._id, item.swift.swiftcode, item.swift.verified];
          });
          res.render('coordinator/swiftverify', { title: 'Conference | verify swift code','users':users, 'username': req.session.firstname, 'role': req.session.role, 'authStatus':'loggedIn'});
          }
      }else{
        next();
      }
    });
  });
});

module.exports = router;
