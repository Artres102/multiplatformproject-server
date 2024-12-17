const express = require('express');
const router = express.Router();
const connection = require('../database');

// Inputs the action on the current room (Used by App)
//How to connect: (hostURL)/input/doInput/sessionId (Where sessionId is equal to a valid sessionId in the Database)
router.put("/doInput/:sessionId/", (req,res) => {
    var sessionId = req.params.sessionId;

    connection.execute("SELECT gamesession_current_room_id FROM osc_game_session WHERE gamesession_id = ?",
        [sessionId],
        function (err, currentRoom) {
            if (err) {
                return console.log(err);
            };
            var roomId = currentRoom[0].gamesession_current_room_id;

            connection.execute("UPDATE osc_input SET input_isdone = 1 WHERE input_gamesession_id = ? AND input_room_id = ?",
                [sessionId,roomId],
                function (err) {
                    if (err) {
                        return console.log(err);
                    };
                    res.json();
                }
            );
        }
    );
});

//Checks if an Input was done in this room (Used by Game)
//How to connect: (hostURL)/input/checkInput/sessionId (Where sessionId is equal to the ID of a valid sessionId in the Database)
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

//Resets all inputs for a session (Used by Game)
//How to connect: (hostURL)/input/resetInput/sessionId (Where sessionId is equal to the ID of a valid sessionId in the Database)
router.get("/resetInput/:sessionId", (req,res) => {
    var sessionId = req.params.sessionId;

    connection.execute("SELECT COUNT(*) AS maxRooms FROM osc_room",
        [],
        function (err, results) {
            if (err) {
                return console.log(err);
            };

            var maxRooms = results[0].maxRooms;

            for (i = 1; i <= maxRooms; i++) {
                connection.execute("UPDATE osc_input SET input_isdone = 0 WHERE input_room_id = ? AND input_gamesession_id = ?",
                    [i,sessionId],
                    function (err) {
                        if (err) {
                            return console.log(err);
                        };
                    }
                );
            };
        }
    );
});

module.exports = router;