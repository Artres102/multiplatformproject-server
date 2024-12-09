// NODE MODULES REQUIRED
const express = require("express");
const session = require('express-session')
const connection = require('./database');

//FILES REQUIRED
const rooms = require("./API/rooms")


// PORT VARIABLES
const serverPort = 3000;


const app = express();

app.use(express.static('www'));
app.use(express.urlencoded({extended:true}));

// DATABASE CONNECTION
connection.connect((err) => {
    if (err){
        console.log("Failed to connect to the DB");
        return;
    };
    console.log("Connected to Database!")
});

//cookers
app.use(session({
    secret: 'OPERATION SILENT CHAOS MOTHERTRUCKER', 
    resave: false,
    saveUninitialized: true, 
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 
     }
}))

// ENDPOINTS
app.get("/", (req,res) => {
    connection.execute("SELECT * FROM osc_room",
        [],
        function (err, results){
            if (err){
                return err;
            } else {
                res.send(results);
            }
        }
    )
});

app.use("/room", rooms);

// SERVER CONNECTION
app.listen(serverPort, () => {
    console.log("Server is connected on port " + serverPort + "!")
});