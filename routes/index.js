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

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.authStatus){
  res.render('home', { title: 'Conference SMU', 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
  } else {
  res.render('home', { title: 'Conference SMU' });
  }});
//get request for login page
router.get('/login', function(req, res, next){
      res.render('login', { title: 'Conference | Login' });
});
//Submission Information display
router.get('/submission_information', function(req, res, next){
  if(req.session.authStatus){
  res.render('submission_information', {title: 'Conference | Submission Information', 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
  } else{
  res.render('submission_information', {title: 'Conference | Submission Information'});
  }
});
//general infromation display
router.get('/general_information', function(req, res, next){
  if(req.session.authStatus){
  res.render('general_information', {title: 'Conference | General Information', 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
  } else{
  res.render('general_information', {title: 'Conference | General Information'});
  }
});
//Travel Information display
router.get('/travel_information', function(req, res, next){
  if(req.session.authStatus){
  res.render('travel_information', {title: 'Conference | Travel Information', 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
  } else{
  res.render('travel_information', {title: 'Conference | Travel Information'});
  }
});
//get request for register page
router.get('/register', function(req, res, next){
  res.render('register', {title : 'Conference | Register' });
});
//post back for register page
router.post('/register', function(req, res, next){
 //res.render('register', {title : 'Conference/'});
 var cipher = crypto.createCipher('aes-128-cbc', '3iusVDK7Ypg7nbPQhtB4tNkXqZPjvNjY');
 cipher.update(req.body.password, 'utf8', 'base64');
 var encrypted = cipher.final('base64');
 MongoClient.connect(connString, function(err, db){
  if(err) throw err;

  var users = db.collection('users');
  users.insert({
    _id:req.body.email,
    firstname:req.body.firstname,
    middlename:req.body.middlename,
    lastname:req.body.lastname,
    title:req.body.title,
    phone:req.body.phone,
    organization:req.body.organization,
    position:req.body.position,
    country:req.body.country,
    address:req.body.address,
    role:'writer',
    password:encrypted,
  },function(err, result){
    if(err) throw err;
    db.close();
    console.log(result);
    res.render('home',{title: 'SMU | Register', username: result.username, role:result.role});
  });
  });
});

router.get('/email', function(req, res, next){
    if(req.session.authStatus && req.session.role === 'coordinator'){
    res.render('coordinator/email', { title: 'Conference | email', 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
  } else if(req.session.authStatus && req.session.role === 'reviewer'){
  res.render('reviewer/email', { title: 'Conference | email', 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
  } else {
    res.redirect('404');
  }
});
router.get('/inbox', function(req, res, next){
    if(req.session.authStatus && req.session.role === 'coordinator'){
    res.render('coordinator/inbox', { title: 'Conference | email', 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
  } else if(req.session.authStatus && req.session.role === 'reviewer'){
  res.render('reviewer/inbox', { title: 'Conference | email', 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
  } else {
    res.redirect('404');
  }
});
router.post('/email', function(req, res, next){
  var transporter = nodemailer.createTransport({
    host: "213.55.83.211", // hostname
    // secureConnection: false, // TLS requires secureConnection to be false
    // port: 587, // port for secure SMTP
    auth: {
        user: "samson_ayalew@smuc.edu.et",
        pass: "12345aA"
    },
    // tls: {
    //     ciphers:'SSLv3'
    // }
  });
  var mailOptions = {
      from: 'samson_ayalew@smuc.edu.et', // sender address
      to: req.body.address, // list of receivers
      subject: req.body.subject, // Subject line
      text: req.body.text // plaintext body
      //html: '<b>Hello world ✔</b>' // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          return console.log(error);
      }
      MongoClient.connect(connString, function(err, db){
        if(err) throw err;

        var users = db.collection('users');
        users.findAndModify(
          {_id:req.session.email},
          {_id: 1},
          {$push:{email:{to: req.body.address,
                  subject:req.body.subject,
                  text: req.body.text,
                  date: new Date()
          }}},
          {upsert: true}, function(err, result){
          if(err) throw err;
          db.close();
          console.log(result);
          res.redirect('/email');
        });
      });
  });
});

router.get('/sent', function(req, res, next){
  MongoClient.connect(connString, function(err, db){
    if(err) throw err;
    users = db.collection('users');
    users.find({_id: req.session.email}).sort({"email.date":1}).toArray(function(err, user){
    if(err) throw err;
    db.close();
    if(req.session.authStatus && req.session.role === 'coordinator'){
      res.render('coordinator/sent', { title: 'Conference | sent','emails': user[0].email, 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
    } else if(req.session.authStatus && req.session.role === 'reviewer'){
      res.render('reviewer/sent', { title: 'Conference | sent','emails': user[0].email,  'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
    } else {
      res.redirect('404');
    }
    console.log(util.inspect(user[0].email));
  })
  })
});
//post back for login page
router.post('/loginpost', function(req, res, next){
    MongoClient.connect(connString, function(err, db){
      if(err) throw err;
      users = db.collection('users');
      users.find({'_id':req.body.email}).toArray(function(err, user){
        if(err) throw err;
        db.close();
        if(user[0].password && user[0]._id){
          var decipher = crypto.createDecipher('aes-128-cbc', '3iusVDK7Ypg7nbPQhtB4tNkXqZPjvNjY');
          decipher.update(user[0].password, 'base64', 'utf8');
          var decrypted = decipher.final('utf8');
          if(req.body.password === decrypted){
            req.session.email = user[0]._id;
            req.session.authStatus = 'loggedIn';
            req.session.user = user[0].username;
            req.session.role = user[0].role;
            res.end();
            // res.render('home', {'title':'SMU Conference', 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
          }else{
            res.status(500).redirect('loginpost', {error:"error"});
          }
        }else{
        //res.status(500).redirect('/login',{title: 'Conference | login', error:'error'});
          res.status(500).render('loginpost', {error:'error'});
        }
      });
    });
});
router.get('/logout', function(req, res, next){
  delete req.session.authStatus;
  delete req.session.user;
  delete req.session.role;
  //res.render('home', { title: 'Conference SMU' });
  res.redirect('/');
});
//faq
router.get('/faq', function(req, res, next){
      if(req.session.authStatus && req.session.role === 'writer'){
      res.render('faq', { title: 'Conference | FAQ', 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
    } else if(req.session.authStatus && req.session.role === 'reviewer'){
    res.render('faq', { title: 'Conference | FAQ', 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
    } else {
      res.render('faq', { title: 'Conference | FAQ'});
    }
});
//contact US
router.get('/contactus', function(req, res, next){
      if(req.session.authStatus && req.session.role === 'writer'){
      res.render('contactus', { title: 'Conference | Contact Us', 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
    } else if(req.session.authStatus && req.session.role === 'reviewer'){
    res.render('contactus', { title: 'Conference | Contact Us', 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
    } else {
      res.render('contactus', { title: 'Conference | Contact Us'});
    }
});
router.get('/category1', function(req, res, next){
  if(req.session.authStatus){
    MongoClient.connect(connString, function(err, db){
      if(err) throw err;
      var users = db.collection('users');
      users.find({'_id': req.session.email}).toArray(function(err, result){
        if(err) throw err;
        db.close();
        res.render('category1', {title: 'Conference | Category1', 'username': req.session.username, 'role':req.session.role, 'authStatus':'loggedIn'});
      })
    });
  }else{
    res.render('category1', {title:'Conference | Category1'});
  }
});

router.get('/category2', function(req, res, next){
  if(req.session.authStatus){
    MongoClient.connect(connString, function(err, db){
      if(err) throw err;
      var users = db.collection('users');
      users.find({'_id': req.session.email}).toArray(function(err, result){
        if(err) throw err;
        db.close();
        res.render('category2', {title: 'Conference | Category2', 'username': req.session.username, 'role': req.session.role, 'authStatus': 'loggedIn'});
      });
    });
  }else{
    res.render('category2', {title: 'Conference | Category2'});
  }
});

router.get('/schedule', function(req, res, next){
  if(req.session.authStatus){
    MongoClient.connect(connString, function(err, db){
      if(err) throw err;
      var users = db.collection('users');
      users.find({'_id': req.session.email}).toArray(function(err, result){
        if(err) throw err;
        db.close();
        res.render('schedule', {title:'Conference | Schedule', 'username': req.session.username, 'role': req.session.role, 'authStatus': 'loggedIn'});
      });
    });
  }else{
    res.render('Schedule', {title: 'Conference | Schedule'});
  }
});

router.get('/sponsors', function(req, res, next){
  if(req.session.authStatus){
    MongoClient.connect(connString, function(err, db){
      if(err) throw err;
      var users = db.collection('users');
      users.find({'_id': req.session.email}).toArray(function(err, result){
        if(err) throw err;
        db.close();
        res.render('sponsors', {title: 'Conference | Sponsors', 'username': req.session.username, 'role': req.session.role, 'authStatus': 'loggedIn'});
      });
    });
  }else{
    res.render('sponsors', {title: 'Conference | Sponsors'});
  }
});
module.exports = router;
