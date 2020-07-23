const mysql = require("mysql");

// Creating DB Connection

const db= mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'nodecrud'
  });
  
  // Connect
  db.connect((err) => {
    if (err) {
        throw err;
    }
    else{
        console.log('Connection Successful');
    }
  });

  module.exports = db;