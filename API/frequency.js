const express = require('express');
const router = express.Router();
const connection = require('../database');

// Gets the frequency of the building you're in based on the current room you're in (Used by App)
router.get("/getFrequency/:sessionId/:roomId", (req,res) => {
    var roomId = req.params.roomId;
    var sessionId = req.params.sessionId;
    var buildingId;
    connection.execute("SELECT room_building_id FROM osc_room WHERE room_id = ?",
        [roomId],
        function (err,results) {
            if (err) {
                return console.log(err);
            }
            buildingId = results[0].room_building_id;

            connection.execute("SELECT frequency_to_match FROM osc_frequency WHERE frequency_building_id = ? AND frequency_session_id = ?",
                [buildingId,sessionId],
                function (err,results) {
                    if (err) {
                        return console.log(err);
                    };
                    
                    if (results.length <= 0) {
                        return null;
                    };
                    var frequency = results[0].frequency_to_match;

                    res.json(frequency);
                }
            );
        }
    );
});

// Inputs the action on the current room (Used by App)
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

module.exports = router;