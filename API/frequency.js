const express = require('express');
const router = express.Router();
const connection = require('../database');

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
                    } else if (results.length <= 0) {
                        return null;
                    }
                    var frequency = results[0].frequency_to_match;

                    res.json(frequency);
                }
            )
        }
    )
});

module.exports = router;