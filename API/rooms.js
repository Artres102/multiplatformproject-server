const express = require('express');
const router = express.Router();
const connection = require('../database');

//This one gets the room you're in (Used by app)
//How to connect: (hostURL)/room/getCurrentRoom/sessionId (Where sessionId is equal to a valid sessionId in the Database)
router.get("/getCurrentRoom/:sessionId", (req, res) => {
    var sessionId = req.params.sessionId;
    var roomId;

    connection.execute("SELECT room_name FROM osc_game_session INNER JOIN osc_room ON gamesession_current_room_id = room_id WHERE gamesession_id = ?",
        [sessionId],
        function (err,results) {
            if (err) {
                return err;
            };
            roomId = results[0].room_name;
            res.json(roomId)
        }
    );
});

//This one CHANGES the room you're in (Used by game)
//How to connect: (hostURL)/room/changeCurrentRoom/sessionId/roomId (Where sessionId and roomId are equal to a valid sessionId or roomId in the Database)
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

module.exports = router;