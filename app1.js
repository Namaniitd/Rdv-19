var express = require('express')
  // , passport          =     require('passport')
  , util              =     require('util')
  // , FacebookStrategy  =     require('passport-facebook').Strategy
  , session           =     require('express-session')
  , cookieParser      =     require('cookie-parser')
  , bodyParser        =     require('body-parser')
  , multer            =     require('multer')
  , config            =     require('./configuration/config')
  , mysql             =     require('mysql')
  , fileUpload        =     require('express-fileupload')
  , fs = require('fs')
  , rimraf = require('rimraf')
  // , https = require('https')
  , jsonexport = require('jsonexport')
  , AWS = require('aws-sdk')
  , app               =     express();

var user, tasks;

session.user = false
session.admin = false


//Define MySQL parameter in Config.js file.
var connection = mysql.createConnection({
  host     : config.host,
  user     : config.username,
  password : config.password,
  database : config.database
  // port: process.env.RDS_PORT
});

//Connect to Database only if Config.js parameter is set.
if(config.use_database==='true')
{
    console.log("yes");
    console.log(config.host+" "+config.username+" "+config.password+" "+config.database+" "+process.env.RDS_PORT);
    // DB Creation
    connection.connect(function(err) {
      if (err) throw(err);
      console.log("Connected!");
      // var sql = "CREATE DATABASE IF NOT EXISTS cap_iitd";
      // connection.query(sql, function (err, result) {
      //   if (err) throw err;
      //   console.log("DB created");
      // });
      var sql = "CREATE TABLE IF NOT EXISTS `tasks` (`task_id` int(2) NOT NULL AUTO_INCREMENT,`task_head` varchar(1000) DEFAULT NULL,`task_desc` varchar(65535) DEFAULT NULL, PRIMARY KEY (`task_id`))";
      connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table tasks created");
      });
      var sql = "CREATE TABLE IF NOT EXISTS `queries` (`id` int(8) NOT NULL AUTO_INCREMENT,`question` varchar(1000) DEFAULT NULL,`answer` varchar(1000) DEFAULT NULL, `answered` int(1) DEFAULT 0, `user` varchar(100) NOT NULL, PRIMARY KEY (`id`))";
      connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table queries created");
      });
      // var sql = "CREATE TABLE IF NOT EXISTS `user_info` (`user_id` varchar(100) NOT NULL,`user_name` varchar(100) NOT NULL, `points` int(8) DEFAULT 0, PRIMARY KEY (`user_id`))";
      var sql = "CREATE TABLE IF NOT EXISTS `user_info` (`user_id` int(8) NOT NULL AUTO_INCREMENT,`user_name` varchar(100) NOT NULL,`email` varchar(100) NOT NULL, `password` varchar(100) NOT NULL, `points` int(8) DEFAULT 0, `admin` int(1) DEFAULT 0, PRIMARY KEY (`user_id`))";
      connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table user_info created");
      });
    });
}
// // Passport session setup.
// passport.serializeUser(function(user, done) {
//   done(null, user);
// });
// passport.deserializeUser(function(obj, done) {
//   done(null, obj);
// });
// // Use the FacebookStrategy within Passport.
// passport.use(new FacebookStrategy({
//     clientID: config.facebook_api_key,
//     clientSecret:config.facebook_api_secret ,
//     callbackURL: config.callback_url
//   },
//   function(accessToken, refreshToken, profile, done) {
//     process.nextTick(function () {
//       //Check whether the User exists or not using profile.id
//       //Further DB code.

//       if(config.use_database==='true')
//       {
//       connection.query("SELECT * from user_info where user_id="+profile.id,function(err,rows,fields){
//         if(err) throw err;
//         if(rows.length===0)
//           {
//             console.log("There is no such user, adding now");
//             connection.query("INSERT into user_info(user_id,user_name) VALUES('"+profile.id+"','"+profile.displayName+"')");
//             // -6 digits
//             // console.log(profile.id);
//           }
//           else
//             {
//               console.log("User already exists in database");
//             }
//           });
//       }


//       return done(null, profile);
//     });
//   }
// ));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat', key: 'sid'}));
// app.use(passport.initialize());
// app.use(passport.session());
app.use(express.static(__dirname + '/public'));
app.use(fileUpload());


if (!fs.existsSync('./public/submissions')){
    fs.mkdirSync('./public/submissions');
}

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/submissions/');
  },
  filename: function (req, file, callback) {
    callback(null, req.session.user.user_id+'_task_'+req.body.task_id + file.fieldname + '-' + Date.now());
  }
});

var upload1 = multer({ storage : storage }).array('file',10);

// app.post('/capPortal/submitted', ensureAuthenticated,  function(req, res){

//   // Check Admin
//   admin = false;
//   if(session.user){
//     if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
//   }

//   user = session.user;

//   if (!req.files)
//     return res.status(400).send('No files were uploaded.');

//   // console.log(req.body);
//   // console.log(req.files);

//   upload(req,res,function(err) {
//         console.log(req);
//         console.log(session.user);
//         console.log(req.body);
//         console.log(req.files);
//         if(err) {
//             return res.status(500).send(err);
//         }
//         // res.end("File is uploaded");
//         connection.query("UPDATE user_info SET task_"+req.body.task_id+"=1 WHERE user_id="+user.user_id+";",function(err,rows,fields){
//         if(err) throw err;

//         });
//         res.redirect('/capPortal/tasks');
//     });
 
//   // // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
//   // let sampleFile = req.files.file;
 
//   // // Use the mv() method to place the file somewhere on your server
//   // // sampleFile.mv('./submissions/'+user.user_id+'_task_'+req.body.task_id+'_'+sampleFile.name, function(err) {
//   // sampleFile.mv('./public/submissions/'+user.user_id+'_task_'+req.body.task_id+'.png', function(err) {
//   //     if (err)
//   //     return res.status(500).send(err);

//   //     connection.query("UPDATE user_info SET task_"+req.body.task_id+"=1 WHERE user_id="+user.user_id+";",function(err,rows,fields){
//   //       if(err) throw err;

//   //       });
 
//   //   // res.send('File uploaded!');
//   //   res.redirect('/capPortal/tasks');
//   // });
// });





const upload = require('multer')({ dest: 'uploads/' });
// app.use(multer({dest:'./public/uploads/'}).single('file'));
if (process.env.NODE_ENV === 'production') {
  app.use('/admin' ,express.static('client/build'));
 app.use(express.static('main'));
}

const authorize = require('./controllers/adminController');
const sessionController = require('./controllers/sessionController');
const regController = require('./controllers/regController');
const teamController = require('./controllers/teamController');
const categoryController = require('./controllers/categoryController');
const venueController = require('./controllers/venueController');
const eventController = require('./controllers/eventController');
const budgetController = require('./controllers/budgetController');
const passBookController = require('./controllers/passBookController');
const passConfirmController = require('./controllers/passConfirmController');
const inviteController = require('./controllers/inviteController');
const rdvPointsController = require('./controllers/rdvPointsController');

//CORS//
const cors = require('cors');
// enable cors
var corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));
//PROCESS.env//
//bodyParser.JSON//

app.post('/api/admin/login', sessionController.login);
app.get('/api/admin/validate-token', sessionController.validateToken);

app.post('/api/register', regController.register);
app.post('/api/login', regController.login);
//app.post('/api/forgot', regController.forgotPassword);
app.post('/api/change', regController.changePassword);
app.get('/api/captcha', regController.recaptcha);
app.get('/api/reg-count', regController.getRegCount);
app.get('/api/admin/registrations', authorize('none'), regController.getRegistrations);

app.get('/api/team', teamController.getTeam);
app.get('/api/team/:email', teamController.getTeamMember);
app.post('/api/admin/team', teamController.addTeamMember);
app.post('/api/admin/team/:email', authorize('fest', 'update_team'), teamController.updateTeamMember);
app.delete('/api/admin/team/:email', authorize('fest', 'update_team') ,teamController.deleteTeamMember);
app.post('/api/admin/update-permissions/:email', authorize('perms', 'update_perms'), teamController.updatePermissions);
app.post('/api/admin/self-update', authorize('self-update'), teamController.selfUpdate);

app.get('/api/category', categoryController.getCategories);
app.post('/api/admin/category', authorize('fest', 'manage_event_categories'), categoryController.addCategory);
app.delete('/api/admin/category/:key', authorize('fest', 'manage_event_categories'), categoryController.deleteCategory);

app.get('/api/venue', venueController.getVenues);
app.post('/api/admin/venue', authorize('fest', 'manage_venues'), venueController.addVenue);
app.delete('/api/admin/venue/:venue', authorize('fest', 'manage_venues'), venueController.deleteVenue);

app.get('/api/event', eventController.getEvents);
app.get('/api/event/:id', eventController.getEvent);
app.post('/api/admin/event', authorize('event'), eventController.addEvent);
app.post('/api/admin/event/upload-photo', upload.single('photo'), eventController.uploadPhoto);
app.delete('/api/admin/event/:id', authorize('event', 'delete'), eventController.deleteEvent);
app.get('/api/category-event/:category', eventController.getEventsCategory);
app.get('/api/admin/event-reg/:id', authorize('event', 'delete'), eventController.getEventReg);

app.post('/api/event/register/:id', eventController.eventReg);

app.get('/api/admin/budget', authorize('budget', 'create_budget_request'), budgetController.getBudgetRequests);
app.get('/api/admin/budget/:id', authorize('budget', 'create_budget_request'), budgetController.getBudgetRequest);
app.post('/api/admin/budget', authorize('budget', 'create_budget_request'), budgetController.addBudgetRequest);
app.post('/api/admin/budget/:id', authorize('budget', 'approve_budget_request'), budgetController.updateBudgetRequest);

app.post('/api/app/rdvPoints', rdvPointsController.set);

// API router for pass system
// app.use('/bohogetaway', passRouter);
// app.set('views', 'main/bohogetaway/views');
// app.set('view engine', 'pug');

app.get('/api/pronite/book', passBookController.book);
app.get('/api/pronite/waitlist-book', passBookController.waitListBook);
app.get('/api/pronite/confirm', passConfirmController.confirm);
app.get('/api/pronite/verify', passConfirmController.verify);
app.get('/api/pronite/pdf', passConfirmController.getPDF);
app.get('/api/pronite/live-reg', passConfirmController.overallReg);
app.get('/api/pronite/live-registration', passConfirmController.overallReg);

app.post('/api/pronite/invite', inviteController.invite);
app.get('/api/invitee-pdf', inviteController.getInviteePDF);
app.get('/api/sponsor-pdf', inviteController.getSponsorPDF);

if (process.env.NODE_ENV === 'production') {
  app.use('/admin/favicon.ico', (req, res) => res.sendFile(`${__dirname}/client/build/favicon.ico`));
  app.use('/admin', (req, res) => res.sendFile(`${__dirname}/client/build/index.html`));
}




















//Router code
app.get('/', function(req, res){
  res.render('coming');
});
app.get('/capPortal/', function(req, res){
  // console.log(session.user);

  // Check Admin
  // admin = false;
//   if(session.user){
//     if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
//   }

  res.render('index', { user: req.session.user, admin: req.session.admin, msg: '' });
});

app.post('/capPortal/login', function(req, res){

  email = req.body.email;
  password = req.body.password;

  // if( (email == "patel.ayush08@gmail.com") && (password == "admin") ){
  //   session.logged = true;
  //   session.user = { 
  //                     "id" : 1953148021403882, 
  //                     "email" : "patel.ayush08@gmail.com",
  //                     "displayName" : "Ayush"
  //                   };
  // }

  sql = "SELECT * from user_info WHERE email='"+email+"' and password='"+password+"';";

  // INSERT into user_info(user_name, email, password, points, admin) VALUES('Ayush21298', 'patel.ayush08@gmail.com', 'admin', 0, 1);

  connection.query(sql, function(err, rows, fields) {
    if(err){
      console.log(err);
    }
    // res.send(rows);
    req.session.admin = false;
    req.session.login = false;
    console.log(rows.length);
    if(rows.length == 0){
      res.redirect('/capPortal');
    } else {
      console.log(rows[0].admin == 1);
      if(rows.length == 1) {
        if(rows[0].admin == 1){
          req.session.admin = true;
        }
        req.session.login = true
        req.session.user = rows[0];
        res.render('index', { user: req.session.user, admin: req.session.admin, msg: 'Logged in Successfully !' });
      } else {
        res.render('index', {user: null, admin : false, msg: 'Please try again'});
      }
    }
  });

  // session.admin = false;
  // if(session.user){
  //   if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ session.admin = true }
  // }

  // res.render('index', { user: session.user, admin: session.admin, msg: 'Logged in Successfully !' });

});

app.get('/capPortal/logout', function(req, res){
  req.session.user = null;
  req.session.login = false;
  req.session.admin = false;
  res.redirect('/capPortal')
});

app.get('/capPortal/rewards', function(req, res){
  // console.log(session.user);

  // Check Admin
  // admin = false;
  // if(session.user){
  //   if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  // }

  res.render('rewards', { user: req.session.user, admin: req.session.admin });
});

app.get('/capPortal/gallery/add', function(req, res){
  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else
  if (req.session.admin != true){
    res.send('Unauthorized, Please login as Admin !!!');
  } else
  // console.log(session.user);

  // Check Admin
  // admin = false;
  // if(session.user){
  //   if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  // }
  if(req.session.admin){
    res.render('addGallery', { user: req.session.user, admin: req.session.admin });
  } else {
    res.send('Unauthorized ... Please login as Admin');
  }
  
});

app.post('/capPortal/gallery/add', function(req, res){
  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else
  if (req.session.admin != true){
    res.send('Unauthorized, Please login as Admin !!!');
  } else
  // console.log(session.user);

  // Check Admin
  // admin = false;
  // if(session.user){
  //   if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  // }
  if (req.session.admin) {
    if (!req.files)
      return res.status(400).send('No files were uploaded.');

    console.log(req.files);
   
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.file;
   
    // Use the mv() method to place the file somewhere on your server
    // sampleFile.mv('./public/submissions/'+user.user_id+'_task_'+req.body.task_id+'_'+sampleFile.name, function(err) {
    

    if (!fs.existsSync('./public/gallery')){
        fs.mkdirSync('./public/gallery');
    }

    try {
      sampleFile.mv('./public/gallery/'+sampleFile.name, function(err) {
          if (err)
          return res.status(500).send(err);
     
        // res.send('File uploaded!');
        // res.redirect('/capPortal/tasks');
      });
    }
    catch(err) {
      for (var i = 0; i < sampleFile.length; i++){
        sampleFile[i].mv('./public/gallery/'+sampleFile[i].name, function(err) {
          if (err)
          return res.status(500).send(err);
     
        // res.send('File uploaded!');
        // res.redirect('/capPortal/tasks');
      });
      }
    }

    res.render('addGallery', { user: req.session.user, admin: req.session.admin });
  } else {
    res.send('Unauthorized ... Please login as Admin');
  }
});

app.get('/capPortal/queries', function(req, res){
  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else 
  // console.log(session.user);
  
  // Check Admin
  // admin = false;
  // if(session.user){
  //   if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  // }

  if (req.session.admin){

    connection.query("SELECT * from queries order by id desc",function(err,rows,fields){
      if(err) throw err;
      // console.log("2");
      console.log(rows);
      // res.send(rows);
      res.render('query', { user: req.session.user, admin: req.session.admin, queries: rows });
    });

  } else {

    connection.query("SELECT * from queries Where user = "+req.session.user.user_id+" order by id desc",function(err,rows,fields){
      if(err) throw err;
      // console.log("2");
      console.log(rows);
      // res.send(rows);
      res.render('query', { user: req.session.user, admin: req.session.admin, queries: rows });
    });

  }
  
});

app.get('/capPortal/queries/answer', function(req, res){
  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else
  if (req.session.admin != true){
    res.send('Unauthorized, Please login as Admin !!!');
  } else
  // console.log(session.user);
  // Check Admin
  // admin = false;
  // if(session.user){
  //   if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  // }
  if (req.session.admin) {
    res.render('answerQuery', { user: req.session.user, admin: req.session.admin, ques_id : req.query.ques_id, ques : req.query.ques }); 
  } else {
    res.send('Unauthorized ... Please login as Admin');
  }
});

app.post('/capPortal/queries/answer', function(req, res){
  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else
  if (req.session.admin != true){
    res.send('Unauthorized, Please login as Admin !!!');
  } else
  // console.log(session.user);

  // Check Admin
  // admin = false;
  // if(session.user){
  //   if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  // }
  if (req.session.admin) {
    if(!req.body.ans){
      res.send('No answer given!!!')
    }

    query = "UPDATE queries set answer='" + req.body.ans +"' WHERE id=" + req.body.id + ";";
    console.log(query);

    connection.query(query,function(err,rows,fields){
      if(err) throw err;
    });

    query = "UPDATE queries set answered=1 WHERE id=" + req.body.id + ";";
    console.log(query);

    connection.query(query,function(err,rows,fields){
      if(err) throw err;
    });

    res.redirect('/capPortal/queries');
  } else {
    res.send('Unauthorized ... Please login as Admin');
  }

});

app.get('/capPortal/queries/add', function(req, res){
  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else {
    // console.log(session.user);

    // Check Admin
    // admin = false;
    // if(session.user){
    //   if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
    // }

    res.render('addQuery', { user: req.session.user, admin: req.session.admin }); 
  }
});

app.post('/capPortal/queries/add', function(req, res){
  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else {
    // console.log(session.user);

    // Check Admin
    // admin = false;
    // if(session.user){
    //   if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
    // }

    if(!req.body.ques){
      res.send('No Question asked !!!')
    }

    query = "INSERT INTO queries(question,user) VALUES('" + req.body.ques + "'," + req.session.user.user_id + ");";
    console.log(query);

    connection.query(query,function(err,rows,fields){
      if(err) throw err;
      // console.log("2");
      // console.log(rows);
      // res.send(rows);
      // res.render('query', { user: session.user, admin: session.admin, queries: rows });
    });

    // res.render('addQuery', { user: req.session.user, admin: req.session.admin }); 
    res.redirect('/capPortal/queries')
  }
});

app.get('/capPortal/gallery', function(req, res){
  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else {
    // console.log(session.user);

    // Check Admin
    // admin = false;
    // if(session.user){
    //   if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
    // }

    fs.readdir('./public/gallery/', function(err, items) {
      // console.log(items);

      // for (var i=0; i<items.length; i++) {
      //     console.log(items[i]);
      // }
      res.render('gallery', { user: req.session.user, admin: req.session.admin, items: items });
    });
  }
  
});

app.get('/capPortal/points', function(req, res){
  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else
  if (req.session.admin != true){
    res.send('Unauthorized, Please login as Admin !!!');
  } else {
    // console.log(session.user);

    // Check Admin
    // admin = false;
    // if(session.user){
    //   if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
    // }

    fs.readdir('./public/submissions/', function(err, items) {
      const response = [];
      // console.log(items);

      // for (var i=0; i<items.length; i++) {
      //     console.log(items[i]);
      // }
      for (let file of items) {
        // const fileSizeInBytes = fs.statSync('./public/submissions/'+file).size;
        // response.push({ name: file, size: fileSizeInBytes });
        // console.log(file);
        fs.readdir('./public/submissions/'+file, function(err, iitt) {
          // console.log(iitt.length);
          // console.log({ name: file, size: iitt.length });
          response.push({ name: file, size: iitt.length });
        });
      }
      // console.log(response);
      res.render('points', { user: req.session.user, admin: req.session.admin, items: items });
    });
  }
  
});

app.get('/capPortal/points/tasks', function(req, res){
  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else
  if (req.session.admin != true){
    res.send('Unauthorized, Please login as Admin !!!');
  } else {
    // console.log(session.user);

    // Check Admin
    // admin = false;
    // if(session.user){
    //   if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
    // }

    console.log(req.query);

    fs.readdir('./public/submissions/'+req.query.task_id, function(err, items) {

      res.render('points_task', { user: req.session.user, admin: req.session.admin, items: items, task_id: req.query.task_id });
    });
  }
  
});

app.get('/capPortal/points/tasks/user', function(req, res){
  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else
  if (req.session.admin != true){
    res.send('Unauthorized, Please login as Admin !!!');
  } else {
    // console.log(session.user);

    // Check Admin
    // admin = false;
    // if(session.user){
    //   if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
    // }

    console.log(req.query);

    fs.readdir('./public/submissions/'+req.query.task_id+'/'+req.query.user_id, function(err, items) {

      res.render('points_user', { user: req.session.user, admin: req.session.admin, items: items, task_id: req.query.task_id, user_id: req.query.user_id });
    });
  }
  
});


app.get('/capPortal/account', ensureAuthenticated, function(req, res){
  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else {

    // Check Admin
    // admin = false;
    // if(session.user){
    //   if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
    // }

    user = req.session.user;
    res.render('account', { user: user, admin: req.session.admin });
  }
});
app.get('/capPortal/tasks', ensureAuthenticated,  function(req, res){
  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else {

    // Check Admin
    // admin = false;
    // if(session.user){
    //   if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
    // }

    user = req.session.user;
    if(config.use_database==='true')
      {
        // console.log("1");
        connection.query("SELECT * from tasks",function(err,rows,fields){
        if(err) throw err;
          // console.log("2");
          console.log(rows);
            res.render('tasks', { user: user, tasks : rows, admin: req.session.admin });
          });
      }
    // console.log(user);
  }
});   
// //Passport Router
// app.get('/capPortal/auth/facebook', passport.authenticate('facebook'));
// app.get('/capPortal/auth/facebook/callback',
//   passport.authenticate('facebook', {
//        successRedirect : '/capPortal',
//        failureRedirect: '/capPortal/login'
//   }),
//   function(req, res) {
//     res.redirect('/');
//   });
// app.get('/capPortal/logout', function(req, res){
//   req.logout();
//   res.redirect('/');
// });
app.get('/capPortal/add_task', ensureAuthenticated,  function(req, res){
  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else

  if (req.session.admin != true){
    res.send('Unauthorized, Please login as Admin !!!');
  } else {

    // Check Admin
    // admin = false;
  //   if(session.user){
  //     if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  //   }

    user = req.session.user;
    res.render('add_task', { user: user , msg : '', admin: req.session.admin });
  }
});
app.get('/capPortal/result', ensureAuthenticated,  function(req, res){
  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else {

    // Check Admin
    // admin = false;
  //   if(session.user){
  //     if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  //   }

    user = req.session.user;
    if( req.session.admin ){
      // console.log(req.body.task_id);
      if(config.use_database==='true')
        {
          // console.log("1");
          connection.query("SELECT * from user_info",function(err,rows,fields){
          if(err) throw err;
            // console.log("2");
            console.log(rows);
              res.send(rows);
            });
        }
      // console.log(user);
    } else {
      res.redirect('/capPortal');
    }
  }
});
app.get('/capPortal/leaderboard', ensureAuthenticated,  function(req, res){
  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else {

    // Check Admin
    // admin = false;
  //   if(session.user){
  //     if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  //   }

    user = req.session.user;
    if( req.session.login ){
      // console.log(req.body.task_id);
      if(config.use_database==='true')
        {
          // console.log("1");
          connection.query("select column_name from information_schema.columns where table_name='user_info';",function(err0,rows0,fields0){
          if(err0) throw err0;
            // console.log("2");
            connection.query("SELECT * from user_info where admin=0 order by points desc",function(err,rows,fields){
            if(err) throw err;
              // console.log("2");
              console.log(rows);
                // res.send(rows);
                res.render('leaderboard', { cols : rows0 , users : rows , user : user, admin: req.session.admin } )
              });
          });
        }
      // console.log(user);
    } else  {
      res.redirect('/capPortal');
    }
  }
});
app.get('/capPortal/leaderboard/find', ensureAuthenticated,  function(req, res){

  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else {

    // Check Admin
    // admin = false;
  //   if(session.user){
  //     if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  //   }

    // user = req.session.user;
    if( req.session.user ){
      // console.log(req.body.task_id);
      if(config.use_database==='true')
        {
          // console.log("1");
          connection.query("select column_name from information_schema.columns where table_name='user_info';",function(err0,rows0,fields0){
          if(err0) throw err0;
            // console.log("2");
            connection.query("SELECT * from user_info where admin=0 order by points desc",function(err,rows,fields){
            if(err) throw err;
              // console.log("2");
              console.log(rows);
                // res.send(rows);
                res.render('leaderboard_2', { cols : rows0 , users : rows , user : user, admin: req.session.admin } )
              });
          });
        }
      // console.log(user);
    } else {
      res.redirect('/capPortal');
    }
  }
});
app.get('/capPortal/export_leaderboard', ensureAuthenticated,  function(req, res){

  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else {

    // Check Admin
    // admin = false;
  //   if(session.user){
  //     if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  //   }

    user = req.session.user;
    if( req.session.admin ){
      // console.log(req.body.task_id);
      if(config.use_database==='true')
        {
          // console.log("1");
          connection.query("select column_name from information_schema.columns where table_name='user_info';",function(err0,rows0,fields0){
          if(err0) throw err0;
            // console.log("2");
            connection.query("SELECT * from user_info",function(err,rows,fields){
            if(err) throw err;
              // console.log("2");
              console.log(rows);
                // res.send(rows);
                jsonexport(rows, function(err,csv){
                  if(err) return console.log(err);
                  // console.log(csv);
                  res.setHeader('Content-disposition', 'attachment: filename=leaderboard.csv');
                  res.set('Content-Type', 'text/csv');
                  res.status(200).send(csv);
                });
              });
          });
        }
      // console.log(user);
    } else {
      res.redirect('/capPortal');
    }
  }
});
app.get('/capPortal/view_submission', ensureAuthenticated,  function(req, res){

  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else {

    // Check Admin
    // admin = false;
  //   if(session.user){
  //     if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  //   }

    user = req.session.user;
    if( req.session.admin ){
      // console.log(req.body.task_id);
      if(config.use_database==='true')
        {
          // console.log(req.query)
          res.render('view_submission', { user : user , user_id : req.query.user_id , task_id : req.query.task_id, admin: req.session.admin })
        }
      // console.log(user);
    } else {
      res.send('Unauthorized, Please login as Admin !!!');
    }
  }
});
app.get('/capPortal/delete_task', ensureAuthenticated, function(req,res){

  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else

  if (req.session.admin != true){
    res.send('Unauthorized, Please login as Admin !!!');
  } else {

    // Check Admin
    // admin = false;
  //   if(session.user){
  //     if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  //   }

    user = req.session.user;
    if( req.session.admin ) {
      res.render('delete_task', { user : user, admin: req.session.admin } );
    } else {
      res.send('Unauthorized, Please login as Admin !!!');
    }
  }
});


// Post Methods

app.post('/capPortal/submission', ensureAuthenticated,  function(req, res){

  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else {

    // Check Admin
    // admin = false;
  //   if(session.user){
  //     if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  //   }

    user = req.session.user;
    // console.log(req.body.task_id);
    // if(config.use_database==='true')
    //   {
    //     // console.log("1");
    //     connection.query("SELECT * from tasks",function(err,rows,fields){
    //     if(err) throw err;
    //       // console.log("2");
    //       console.log(rows);
    //       tasks = rows;
    //       });
    //   }
    console.log(user);
    res.render('submission', { user: user , task_id : req.body.task_id, admin: req.session.admin });
  }
});

app.post('/capPortal/submitted', ensureAuthenticated,  function(req, res){

  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else {

    // Check Admin
    // admin = false;
  //   if(session.user){
  //     if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  //   }

    user = req.session.user;

    if (!req.files)
      return res.status(400).send('No files were uploaded.');

   console.log("plsssssssssssssssss")
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.file;
   
    // Use the mv() method to place the file somewhere on your server
    // sampleFile.mv('./submissions/'+user.user_id+'_task_'+req.body.task_id+'_'+sampleFile.name, function(err) {
    

    // if (!fs.existsSync('./public/submissions/task_'+req.body.task_id+'/'+user.user_id)){
    //     fs.mkdirSync('./public/submissions/task_'+req.body.task_id+'/'+user.user_id);
    // }
// details of aws
  AWS.config.update({
    accessKeyId: "AKIAIMEEAD3XNEOEMZZQ",
    secretAccessKey: "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",
    region: "ap-south-1",
    endpoint: new AWS.Endpoint('https://s3.ap-south-1.amazonaws.com'),
  });

  // console.log(req.file);
  
  let s3Bucket = new AWS.S3();
  var ar = Array.isArray(req.files.file);
  // console.log()
   console.log(req.files.file);
  console.log(sampleFile.length);
  //req.body.filename;
  // fs.readFile(req.files.path, (err, data) => {
    // if (err) {
    //   console.log(err);
    //   fs.unlink(req.file.path, () => utils.error(res, 500, "Error Uploading Image"));
    // }
  try{

  if(ar)
  for(var i=0;i<sampleFile.length;i++){
  let filename =     req.body.task_id+"_"+user.user_id+"_"+sampleFile[i].name;
  var data = req.files.file[i].data;
    let s3Data = {
      ACL: "public-read",
      Bucket: 'elasticbeanstalk-ap-south-1-899753036576',
      Key: "event_images/" + filename,
      Body: data,
      ContentType: "image/jpeg"
    };
    s3Bucket.putObject(s3Data, function(err, resp) {
      console.log(resp);
      if (err) {
        console.log(err);
        // fs.unlink(req.file.path, () => utils.error(res, 500, "Error Uploading Image"));
      } else {
        connection.query("UPDATE user_info SET task_"+req.body.task_id+"=1 WHERE user_id="+user.user_id+";",function(err,rows,fields){
        if(err) throw err;
        });
        connection.query("SELECT task_"+req.body.task_id+"_no from user_info WHERE user_id="+user.user_id+";",function(err1,rows1,fields1){
        if(err1) throw err1;
          console.log(rows1[0]);
          connection.query("UPDATE user_info SET task_"+req.body.task_id+"_no="+(rows1[0]["task_"+req.body.task_id+"_no"]+1)+" WHERE user_id="+user.user_id+";",function(err2,rows2,fields2){
          if(err2) throw err2;
          });
        });
        // return res.json({
        //   error: false,
        //   message: "Image Uploaded successfully!",
        //   img: "https://s3.ap-south-1.amazonaws.com/elasticbeanstalk-ap-south-1-899753036576/event_images/" + filename,
        // });
      }
    });
  }
  else{
    let filename =     req.body.task_id+"_"+user.user_id+"_"+sampleFile.name[i];
  var data = req.files.file.data;
    let s3Data = {
      ACL: "public-read",
      Bucket: 'elasticbeanstalk-ap-south-1-899753036576',
      Key: "event_images/" + filename,
      Body: data,
      ContentType: "image/jpeg"
    };
    s3Bucket.putObject(s3Data, function(err, resp) {
      console.log(resp);
      if (err) {
        console.log(err);
        // fs.unlink(req.file.path, () => utils.error(res, 500, "Error Uploading Image"));
      } else {
        connection.query("UPDATE user_info SET task_"+req.body.task_id+"=1 WHERE user_id="+user.user_id+";",function(err,rows,fields){
        if(err) throw err;
        });
        connection.query("SELECT task_"+req.body.task_id+"_no from user_info WHERE user_id="+user.user_id+";",function(err1,rows1,fields1){
        if(err1) throw err1;
          console.log(rows1[0]);
          connection.query("UPDATE user_info SET task_"+req.body.task_id+"_no="+(rows1[0]["task_"+req.body.task_id+"_no"]+1)+" WHERE user_id="+user.user_id+";",function(err2,rows2,fields2){
          if(err2) throw err2;

          });
        });
        // return res.json({
        //   error: false,
        //   message: "Image Uploaded successfully!",
        //   img: "https://s3.ap-south-1.amazonaws.com/elasticbeanstalk-ap-south-1-899753036576/event_images/" + filename,
        // });
      }
    });
  }
}
    catch(err) {
        for(var i=0; i<sampleFile.length;i++) {
            sampleFile[i].mv('./public/submissions/task_'+req.body.task_id+'/'+user.user_id+'/'+sampleFile[i].name, function(err) {
              if (err)
              return res.status(500).send(err);

              connection.query("UPDATE user_info SET task_"+req.body.task_id+"=1 WHERE user_id="+user.user_id+";",function(err,rows,fields){
              if(err) throw err;
              });    
            // res.send('File uploaded!');
          });
        }
    }

    res.redirect('/capPortal/tasks');

    // console.log(req.files);
    // if(config.use_database==='true')
    //   {
    //     // console.log("1");
    //     connection.query("SELECT * from tasks",function(err,rows,fields){
    //     if(err) throw err;
    //       // console.log("2");
    //       console.log(rows);
    //       tasks = rows;
    //       });
    //   }
    // console.log(user);
    // res.redirect('tasks');
  }
});

app.post('/capPortal/add_task', ensureAuthenticated,  function(req, res){

  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else

  if (req.session.admin != true){
    res.send('Unauthorized, Please login as Admin !!!');
  } else {

    // Check Admin
    // admin = false;
  //   if(session.user){
  //     if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  //   }

    user = req.session.user;

    if( req.session.admin ){
      // console.log(req.body.task_id);
      if(!req.body.task_desc || !req.body.task_head)
        res.render('add_task', {user: user, msg : 'Fields cannot be empty', admin: req.session.admin} );
      // var task_desc = req.body.task_desc;
      if(config.use_database==='true')
        {
          var temp_id;
          // console.log("1");
          console.log("INSERT into tasks(task_head,task_desc) values("+req.body.task_head+","+req.body.task_desc+");");
          connection.query("INSERT into tasks(task_head,task_desc) values('"+req.body.task_head+"','"+req.body.task_desc+"');",function(err,result){
          if(err) throw err;
            // console.log("2");
            // console.log(rows);
            // tasks = rows;
            console.log("Added task in Task Table")
            });
          connection.query("SELECT * from tasks WHERE task_desc='"+req.body.task_desc+"';",function(err,rows,fields){
          if(err) throw err;
            // console.log("2");
            // console.log(rows);
            // tasks = rows;
            temp_id=rows[0].task_id;
            console.log("Got Task ID");
            console.log(rows);
            console.log(temp_id);

              connection.query("ALTER TABLE user_info ADD COLUMN task_"+temp_id+" integer(8) default 0;",function(err1,result1){
              
                connection.query("ALTER TABLE user_info ADD COLUMN task_"+temp_id+"_no integer(8) default 0;",function(err2,result2){
                
                if (!fs.existsSync('./public/submissions/task_'+temp_id)){
                    fs.mkdirSync('./public/submissions/task_'+temp_id);
                }

                if(err2) throw err2;
                  // console.log("2");
                  // console.log(rows);
                  // tasks = rows;
                  console.log("Added task in User Table")
                });

              if(err1) throw err1;
                // console.log("2");
                // console.log(rows);
                // tasks = rows;
                console.log("Added task in User Table")
              });

            });
        }
      // console.log(user);
      res.render('add_task', {msg : 'Added Task Successfully', user : user, admin: req.session.admin } );
    }
    else{
      res.send('Unauthorized ... Please login as Admin !!!')
    }
    // res.render('submission', { user: user , task_id : req.body.task_id});
  }
});

app.post('/capPortal/delete_task', ensureAuthenticated,  function(req, res){

  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else

  if (req.session.admin != true){
    res.send('Unauthorized, Please login as Admin !!!');
  } else {

    // Check Admin
    // admin = false;
  //   if(session.user){
  //     if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  //   }


    user = req.session.user;
    if( req.session.admin ){
      // console.log(req.body.task_id);
      if(config.use_database==='true')
        {
          // console.log("1");

          connection.query("SELECT * from tasks WHERE task_id="+req.body.task_id+";",function(err,rows,fields){
          if(err) throw err;
            // console.log("2");
            // console.log(rows.length);
            if (rows.length > 0) {
              // res.send(rows);
              connection.query("DELETE FROM tasks WHERE task_id="+req.body.task_id+";",function(err1,result1){
                if(err1) throw err1;
              });
              connection.query("ALTER TABLE user_info DROP COLUMN task_"+req.body.task_id+";",function(err1,result1){
                if(err1) throw err1;
              }); 
            }

          });

          res.redirect('/capPortal/leaderboard');

        }
      // console.log(user);
    } else {
      res.send('Unauthorized ... Please login as Admin !!!')
    }
  }
});

app.post('/capPortal/approve', ensureAuthenticated,  function(req, res){

  if(req.session.login != true) {
    res.redirect('/capPortal');
  } else {

    // Check Admin
    // admin = false;
  //   if(session.user){
  //     if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){ admin = true }
  //   }

    user = req.session.user;
    if( req.session.admin ){
      // console.log(req.body.task_id);
      if(config.use_database==='true')
        {
          // console.log("1");
          // if(!req.body.item)
          //   res.send("No item Specified !");
          // if(!req.body.task_id)
          //   res.send("No Task Specified !");
          // if(!req.body.points)
          //   res.send("No Points Specified !");

          temp_score = 0;

          console.log("SELECT "+req.body.task_id+" from user_info WHERE user_id="+req.body.user_id+";");
          connection.query("SELECT "+req.body.task_id+" from user_info WHERE user_id="+req.body.user_id+";",function(err8,rows8,fields8){
            if(err8) throw err8;
            temp_x = req.body.task_id;
            console.log(temp_x);
            temp_score = rows8[0][temp_x];
            console.log(rows8);
            console.log(temp_score);
            console.log(req.body);

            console.log("UPDATE user_info SET "+req.body.task_id+"="+req.body.points+" WHERE user_id="+req.body.user_id+";");
            connection.query("UPDATE user_info SET "+req.body.task_id+"="+req.body.points+" WHERE user_id="+req.body.user_id+";",function(err,rows,fields){
            if(err) throw err;

            });
            console.log(1);

            console.log("SELECT points from user_info WHERE user_id="+req.body.user_id+";");
            connection.query("SELECT points from user_info WHERE user_id="+req.body.user_id+";",function(err,rows,fields){
              if(err) throw err;
              console.log(2);

              // console.log(rows);

              console.log("UPDATE user_info SET points="+(parseInt(rows[0].points)+parseInt(req.body.points))+" WHERE user_id="+req.body.user_id+";");
              connection.query("UPDATE user_info SET points="+(parseInt(rows[0].points)+parseInt(req.body.points))+" WHERE user_id="+req.body.user_id+";",function(err1,rows1,fields1){
                if(err1) throw err1;
                console.log(3);

                rimraf('./public/submissions/'+req.body.task_id+'/'+req.body.user_id, function () { console.log('done'); });

                });

            });

          });

          // res.redirect('back');
          // res.redirect(url.format({
          //       pathname:'/capPortal/points/tasks',
          //       query:{ 'task_id' : req.body.task_id }
          //     })
          // );
          res.redirect('/capPortal/points/tasks?task_id='+req.body.task_id);

        }
      // console.log(user);
    } else {
      res.redirect('/capPortal/');
    }
  }
});

// Authentication

function ensureAuthenticated(req, res, next) {
  // if (req.isAuthenticated()) { 
  //   if( (session.user.user_id==1953148021403882) || (session.user.user_id==121546228758844) ){
  //     session.admin = true;
  //   }
  //   return next(); }
  // res.redirect('/capPortal')
  return next();
}
// app.listen(3000);

app.set('port', process.env.PORT || 3000);
// app.listen(process.env.PORT || 8081);
app.listen(app.get('port'), function () {
    console.log('Application running in port '+ app.get('port'));
})

// HTTPS Server

// https.createServer({
//   key: fs.readFileSync('server.key'),
//   cert: fs.readFileSync('server.cert')
// }, app)
// .listen(8080, function () {
//   console.log('Example app listening on port 8080! Go to https://localhost:8080/')
// })
