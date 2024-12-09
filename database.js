require("dotenv").config()
var mysql = require("mysql2");

var hostname = process.env.DB_HOST;
var database = process.env.DB_NAME;
var username = process.env.DB_USER;
var password = process.env.DB_PASSWORD;

var connection = mysql.createConnection({
  host: hostname,
  user: username,
  password: password,
  database: database,
});

module.exports = connection