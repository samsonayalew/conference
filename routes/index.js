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
var attachment = multer({dest: 'attachment/'});

var MongoClient = require('mongodb').MongoClient;
var connString = 'mongodb://localhost:27017/conference';


var transporter = nodemailer.createTransport({
  host: "213.55.83.211",
  auth: {
    user: "conference@smuc.edu.et",
    pass: "12345aA"
    }
  });

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

//post back for login page
router.post('/loginpost', function(req, res, next){
    MongoClient.connect(connString, function(err, db){
      if(err) next(err);
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
            res.status(200).end();
            // res.render('home', {'title':'SMU Conference', 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
          }else{
            // res.status(500).redirect('login', {error:"error"});
            res.status(500).end();
          }
        }else{
          // res.status(500).render('login', {error:'error'});
          res.status(500).end();
        }
      });
    });
});

// router.get('/login/:id', function(req, res, next){
//     if(req.session.authStatus){
//     res.render('home', { title: 'Conference SMU', 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
//     } else {
//     res.render('home', { title: 'Conference SMU' });
//     }
// });

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
//participate
router.get('/participate', function(req, res, next){
  res.render('participate', {title:'Conference | Participate'});
});

router.post('/participate', function(req, res, next){

   //res.render('register', {title : 'Conference/'});
   var cipher = crypto.createCipher('aes-128-cbc', '3iusVDK7Ypg7nbPQhtB4tNkXqZPjvNjY');
   cipher.update(req.body.password, 'utf8', 'base64');
   var encrypted = cipher.final('base64');
   MongoClient.connect(connString, function(err, db){
    if(err) next(err);

    var users = db.collection('users');
    users.insert({
      _id:req.body.email,
      swiftcode:req.body.swiftcode,
      firstname:req.body.firstname,
      middlename:req.body.middlename,
      lastname:req.body.lastname,
      title:req.body.title,
      phone:req.body.phone,
      organization:req.body.organization,
      position:req.body.position,
      country:req.body.country,
      address:req.body.address,
      verified:false,
      role:'participant',
      password:encrypted,
    },function(err, result){
      if(err) next(err);
      req.session.email = user[0]._id;
      req.session.authStatus = 'loggedIn';
      req.session.user = user[0].username;
      req.session.role = user[0].role;

      db.close();
      console.log(result);
      res.redirect('/');
    });
    });
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
 var rand=Math.floor((Math.random() * 100) + 54);
 var host = req.host;
 var link = "http://" + host + "/verify?id" + rand;
 mailOptions={
         to : req.body.email,
         subject : "Please confirm your Email account",
         html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
       }
 var cipher = crypto.createCipher('aes-128-cbc', '3iusVDK7Ypg7nbPQhtB4tNkXqZPjvNjY');
 cipher.update(req.body.password, 'utf8', 'base64');
 var encrypted = cipher.final('base64');
 MongoClient.connect(connString, function(err, db){
  if(err) next(err);

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
    verified: false,
    rand: rand
  },function(err, result){
    if(err) next(err);
    db.close();
    console.log(result);
    smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
       console.log(error);
       res.end("error");
     }else{
       console.log("Message sent: " + response.message);
       res.render('home',{title: 'SMU | Register', username: result.username, role:result.role});
    }
    });
    });
  });
});
router.get('/verify', function(req, res, next){
  console.log(req.protocol+":/"+req.get('host'));
  if((req.protocol+"://" + req.host)===("http://" + req.host))
  {
    MongoClient.connect(connString, function(err, db){
      var users = db.collection('users');

      users.find({'rand':req.query.id}).toArray(function(err, user){

        if(user.length === 0){
            req.end('<h1>Request is from unknown source</h1>');
        }else{
          users.updateOne({'rand':req.query.id}, {'verify':true}, {'upsert':true}, function(err, result){
            if(err) throw err;
            db.close();
            smtpTransport.sendMail(mailOptions, function(error, response){
              if(error){
                throw err;
              }else{
                console.log("Message sent: " + response.message);
                mailOptions={
                        to : req.body.email,
                        subject : "Your email is confirmed",
                        html : "Thank you for registering to our website."
                }
                req.redirect('/');
              }
            });
          });
        }
      });
    });
  }
  else{
    req.end('<h1>Request is from unknown source</h1>');
  }
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
  MongoClient.connect(connString, function(err, db){
    if(err) next(err);

    var users = db.collection('users');
    users.find({_id:req.session.email},{inbox:1}).toArray(function(err, users){
    if(req.session.authStatus && req.session.role === 'coordinator') {
      res.render('coordinator/inbox', { title: 'Conference | email', 'inbox':users.inbox, 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
    }else if(req.session.authStatus && req.session.role === 'writer') {
      res.render('writer/inbox', { title: 'Conference | email', 'inbox':users.inbox, 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
    } else if(req.session.authStatus && req.session.role === 'reviewer') {
      res.render('reviewer/inbox', { title: 'Conference | email', 'inbox':users.inbox, 'username': req.session.username, 'role': req.session.role, 'authStatus':'loggedIn'});
    } else {
      res.redirect('404');
    }
  });
  });
});
//send email
router.post('/email', attachment.fields([{name:'address', maxCount:1},{name:'subject', maxCount:1},
            {name:'text', maxCount:1}, {name:'file', maxCount:1}]), function(req, res, next){
  //defind a file to attach
    if(req.files){
        var file = {
        originalname: req.files.file[0].originalname,
        encoding: req.files.file[0].encoding,
        mimitype: req.files.file[0].mimetype,
        destination: req.files.file[0].destination,
        filename: req.files.file[0].filename,
        size: req.files.file[0].size,
        date: new Date()
        };
  }
      if(req.session.role === 'coordinator'){
        var from = 'conference@smuc.edu.et';
      } else {
        var from = req.session.email;
      }
  var mailOptions = {
      from: from, //sender address
      to: req.body.address, // list of receivers
      subject: req.body.subject, // Subject line
      text: req.body.text, // plaintext body
      attachments: [
        {   // file on disk as an attachment
            filename: file.originalname,
            path: '/attachment/'+ file.filename // stream this file
        }]
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
          {$push:{sent:{to: req.body.address,
                  subject:req.body.subject,
                  text: req.body.text,
                  date: new Date()
          }}},
          {upsert: true}, function(err, result){
          if(err) throw err;
          users.findAndModify(
            {_id:req.body.address},
            {_id: 1},
            {$push:{inbox:{to: req.body.address,
                    subject:req.body.subject,
                    text: req.body.text,
                    read: false,
                    attachment: file,
                    date: new Date()
            }}},
            {upsert: true}, function(err, result){
              db.close();
              console.log(result);
              res.redirect('/email');
        });
      });
      });
  });
});

router.get('/sent', function(req, res, next){
  MongoClient.connect(connString, function(err, db){
    if(err) next(err);
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
router.get('/theme', function(req, res, next){
  if(req.session.authStatus){
    MongoClient.connect(connString, function(err, db){
      if(err) throw err;
      var users = db.collection('users');
      users.find({'_id': req.session.email}).toArray(function(err, result){
        if(err) throw err;
        db.close();
        res.render('theme', {title: 'Conference | Theme', 'username': req.session.username, 'role':req.session.role, 'authStatus':'loggedIn'});
      })
    });
  }else{
    res.render('theme', {title:'Conference | Theme'});
  }
});

router.get('/schedule', function(req, res, next){
  if(req.session.authStatus){
    MongoClient.connect(connString, function(err, db){
      if(err) next(err);
      var users = db.collection('users');
      users.find({'_id': req.session.email}).toArray(function(err, result){
        if(err) next(err);
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
      if(err) next(err);
      var users = db.collection('users');
      users.find({'_id': req.session.email}).toArray(function(err, result){
        if(err) next(err);
        db.close();
        res.render('sponsors', {title: 'Conference | Sponsors', 'username': req.session.username, 'role': req.session.role, 'authStatus': 'loggedIn'});
      });
    });
  }else{
    res.render('sponsors', {title: 'Conference | Sponsors'});
  }
});
module.exports = router;
