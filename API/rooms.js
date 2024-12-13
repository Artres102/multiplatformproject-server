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
            }
            roomId = results[0].gamesession_current_room_id;
            
            res.json(roomId)
        }
    )
});

//This one CHANGES the room you're in (Used by game)
router.put("/changeCurrentRoom/:sessionId/:roomId", (req,res) => {
    var sessionId = req.params.sessionId;
    var roomId = req.params.roomId
    connection.execute("UPDATE osc_game_session SET gamesession_current_room_id = ? WHERE gamesession_id = ?",
        [roomId,sessionId],
        function (err,results) {
            if (err) {
                return err;
            }
        }
    )
});

module.exports = router;