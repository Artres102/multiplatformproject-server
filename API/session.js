const express = require('express');
const router = express.Router();
const connection = require('../database');

//Gets session
router.get("/checkCode/:code", (req,res) => {
    var code = req.params.code;

    connection.execute("SELECT gamesession_id FROM osc_game_session WHERE gamesession_code = ?",
        [code],
        function (err,results) {
            if (err) {
                return console.log(err);
            }
            var sessionId = results[0].gamesession_id;

            res.json(sessionId);
        }
    )
});

module.exports = router;