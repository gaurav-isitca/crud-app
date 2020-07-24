var express = require('express');
var router = express.Router();
var db = require('../db/db');
const bcrypt = require('bcrypt');
var session = require('express-session');

router.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Node CRUD App' });
});

// Register
router.post('/register', (req, res) => {
  const user = req.body.username;
  let sqlQuery = "SELECT 1 FROM users WHERE username = '"+user+"' ORDER BY username LIMIT 1";
  db.query(sqlQuery, function(error, results){
	// There was an issue with the query
	if(error){
    if (error) throw error;
		res.redirect('/')
	}
	if(results.length){
    res.send('Username already exists')
	}else{
    let pwd = bcrypt.hashSync(req.body.password, 10);
    let data = {username : req.body.username, password : pwd};
    let sql = 'INSERT INTO users SET ?';
    let query = db.query(sql, data, (err, results) => {
        res.redirect('/');
    });
	}
});
});

// Login
router.post('/login', function(request, response) {
	let username = request.body.username_login;
  let password = request.body.password_login;
	if (username && password) {
		db.query('SELECT * FROM users WHERE username = ?', [username], function(error, results, fields) {
      if(bcrypt.compareSync(request.body.password_login, results[0].password)) {
        request.session.loggedin = true;
        request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

// Logout

router.get("/logout", (req, res) => {
  req.session.loggedin = false;
  res.redirect('/')
  });

// Home Page

router.get('/home', (req, res) => {
  if (req.session.loggedin) {
  let sql = 'SELECT * FROM contacts';
  let query = db.query(sql,(err, rows) => {
      if (err){
          throw err;
      }
      else{
          res.render('user_index', {
            user : rows,
            user_loggedin : req.session.username
          });
      }
  }); 
}
else{
  res.send('Login to view this page..')
}
});

router.post('/save', (req, res) => {
  let data = {first_name : req.body.first_name, middle_name : req.body.middle_name, last_name : req.body.last_name, contact_number : req.body.phone};
  let sql = 'INSERT INTO contacts SET ?';
  let query = db.query(sql, data, (err, results) => {
      res.redirect('/home');
  });
});

router.get('/edit/:userId', (req, res) => {
  const userId = req.params.userId;
  let sql = `SELECT * FROM contacts WHERE sno = ${userId}`;
  let query = db.query(sql,(err, result) => {
      if (err){
          throw err;
      }
      else{
          res.render('edit_user', {
            user : result[0],
            user_loggedin : req.session.username 
          });
      }
  }); 
});

router.post('/update', (req, res) => {
  const userId = req.body.sno;
  let sql = "update contacts SET first_name='"+req.body.first_name+"', middle_name='"+req.body.middle_name+"', last_name='"+req.body.last_name+"', contact_number='"+req.body.phone+"' where sno = "+userId; 
  let query = db.query(sql, (err, results) => {
      if (err) throw err;
      res.redirect('/home');
  });
});

router.get('/delete/:userId', (req, res) => {
  const userId = req.params.userId;
  let sql = `DELETE FROM contacts WHERE sno = ${userId}`;
  let query = db.query(sql,(err, result) => {
      if (err){
          throw err;
      }
      else{
          res.redirect('/home');
      }
  }); 
});


module.exports = router;
