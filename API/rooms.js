const express = require('express');
const router = express.Router();
const connection = require('../database');

//This one gets the room you're in
router.get("/getCurrentRoom/:sessionId", (req, res) => {
    var sessionId = req.params.sessionId;
    var roomId;

    connection.execute("SELECT gamesession_current_room_id FROM osc_game_session WHERE gamesession_id = ?",
        [sessionId],
        function (err,results) {
            if (err) {
                return err;
            }
            roomId = results[0].gamesession_current_room_id;
            console.log(roomId);
            res.json(roomId)
        }
    )
});

//This one CHANGES the room you're in
router.get("/changeCurrentRoom/:sessionId/:roomId", (req,res) => {
    var sessionId = req.params.sessionId;
    var roomId = req.params.roomId;

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