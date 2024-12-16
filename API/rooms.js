const express = require('express');
const router = express.Router();
const connection = require('../database');

//This one gets the room you're in (Used by app)
router.get("/getCurrentRoom/:sessionId", (req, res) => {
    var sessionId = req.params.sessionId;
    var roomId;

    connection.execute("SELECT room_name FROM osc_game_session INNER JOIN osc_room ON gamesession_current_room_id = room_id WHERE gamesession_id = ?",
        [sessionId],
        function (err,results) {
            if (err) {
                return err;
            };
            roomId = results[0].gamesession_current_room_id;
            
            res.json(roomId);
        }
    );
});

//This one CHANGES the room you're in (Used by game)
router.put("/changeCurrentRoom/:sessionId/:roomId", (req,res) => {
    var sessionId = req.params.sessionId;
    var roomId = req.params.roomId;

    connection.execute("UPDATE osc_game_session SET gamesession_current_room_id = ? WHERE gamesession_id = ?",
        [roomId,sessionId],
        function (err,results) {
            if (err) {
                return err;
            };
        }
    );
});

router.get("/checkInput/:sessionId", (req,res) => {
    var sessionId = req.params.sessionId;

    connection.execute("SELECT gamesession_current_room_id FROM osc_game_session WHERE gamesession_id = ?",
        [sessionId],
        function (err, results) {
            if (err) {
                return console.log(err);
            };
            var roomId = results[0].gamesession_current_room_id

            connection.execute("SELECT input_isdone FROM osc_input WHERE input_gamesession_id = ? AND input_room_id = ? AND input_isdone = 1",
                [sessionId,roomId],
                function (err, results) {
                    if (err) {
                        return console.log(err);
                    };
                    
                    if (results.length <= 0) {
                        return res.json(0)
                    } else {
                        res.json(1)
                    }
                }
            );
        }
    );
});

module.exports = router;