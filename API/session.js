const express = require('express');
const router = express.Router();
const connection = require('../database');

// Gets session by code (Used by app)
router.get("/checkCode/:code", (req,res) => {
    var code = req.params.code;

    connection.execute("SELECT gamesession_id FROM osc_game_session WHERE gamesession_code = ?",
        [code],
        function (err,results) {
            if (err) {
                return console.log(err);
            };

            if (results.length <= 0) {
                return res.json("Invalid Code!")
            };
            var sessionId = results[0].gamesession_id;

            res.json(sessionId);
        }
    );
});

// Create the session in the Game Session table (Used in game)
router.get("/createSession", (req,res) => {
    var code = generateCode();

    connection.execute("SELECT gamesession_code FROM osc_game_session WHERE gamesession_code = ?",
        [code],
        function (err,results) {
            if (err) {
                return console.log(err)
            };

            if (results.length > 0) {
                res.redirect("/game/createSession")
            };

            connection.execute("INSERT INTO osc_game_session(gamesession_code,gamesession_current_room_id) VALUES(?,'1')",
                [code],
                function(err) {
                    if (err) {
                        return console.log(err)
                    };
                    res.json("Code Generated!");
                }
            );
        }
    );
})

//Generate Connection Code
function generateCode() {
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let maxCodeLength = 5;
    let code = '';
    
    for (i = 0; i < maxCodeLength; i++) {
        var randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    };

    return code;
}

module.exports = router;