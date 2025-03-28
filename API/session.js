const express = require('express');
const router = express.Router();
const connection = require('../database');

// Gets session by code (Used by app).
//How to connect: (hostURL)/game/checkCode/code (Where code is a valid 5 character/digit long code)
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
//How to connect: (hostURL)/game/createSession
router.post("/createSession", (req,res) => {
    var code = generateCode();

    connection.execute("SELECT max(gamesession_id) AS currentId FROM osc_game_session",
        [],
        function (err, results) {
            if (err) {
                return console.log(err)
            }
            var currentId = results[0].currentId + 1

            connection.execute("SELECT gamesession_code FROM osc_game_session WHERE gamesession_code = ?",
                [code],
                function (err,rows) {
                    if (err) {
                        return console.log(err)
                    };
        
                    if (rows.length > 0) {
                        res.redirect("./createSession");
                    };
        
                    connection.execute("INSERT INTO osc_game_session(gamesession_code,gamesession_current_room_id) VALUES(?,'1')",
                        [code],
                        function(err) {
                            if (err) {
                                return console.log(err);
                            };

                            var data = {
                                "code": code,
                                "sessionId": currentId
                            };

                            createInputList(currentId);
                            generateFrequencies(currentId);

                            res.json(data);
                        }
                    );
                }
            );
        }
    );
});

//Resets all inputs for a session (Used by Game)
//How to connect: (hostURL)/game/resetCurrentSession/sessionId (Where sessionId is equal to the ID of a valid sessionId in the Database)
router.put("/resetCurrentSession/:sessionId", (req,res) => {
    var sessionId = req.params.sessionId;

    connection.execute("UPDATE osc_game_session SET gamesession_current_room_id = 1 WHERE gamesession_id = ?",
        [sessionId],
        function (err) {
            if (err) {
                return console.log(err);
            };

            resetInputs(sessionId);
            checkFrequencies(sessionId);
        }
    );
});

// Makes all of the inputs become false
function resetInputs(sessionId) {
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
};

//Generate Connection Code
function generateCode() {
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let maxCodeLength = 5;
    let code = '';
    
    for (i = 1; i <= maxCodeLength; i++) {
        var randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    };

    return code;
}

//Automatically Inserts all room inputs in the database for the session in question
function createInputList(sessionId) {
    connection.execute("SELECT COUNT(*) AS rooms FROM osc_room",
        [],
        function (err, results) {
            if (err) {
                return console.log(err);
            };
            var maxRooms = results[0].rooms;

            for (i = 1; i <= maxRooms; i++) {
                connection.execute("INSERT INTO osc_input(input_gamesession_id,input_room_id,input_isdone) VALUES(?,?,false)",
                    [sessionId,i],
                    function (err) {
                        if (err) {
                            return console.log(err);
                        };
                    }
                );
            };
        }
    );
};

// Generates all the frequencies for the database
function generateFrequencies(sessionId) {
    connection.execute("SELECT COUNT(*) AS countBuildings FROM osc_building",
        [],
        function (err, results) {
            if (err) {
                return console.log(err)
            }
            var buildingCount = results[0].countBuildings;

            var maxFrequency = 120;
            var minFrequency = 50;
            for (i = 1; i <= buildingCount; i++) {
            
                var frequency = Math.floor(Math.random() * (maxFrequency - minFrequency + 1)) + minFrequency;

                connection.execute("INSERT INTO osc_frequency(frequency_building_id,frequency_session_id,frequency_to_match) VALUES (?,?,?)",
                    [i,sessionId,frequency],
                    function (err) {
                        if (err) {
                            return console.log(err);
                        };
                    }
                );
            };
        }
    );
};

//Checks if a session has generated frequencies
function checkFrequencies(sessionId) {
    connection.execute("SELECT * FROM osc_frequency WHERE frequency_session_id = ?",
        [sessionId],
        function (err,results) {
            if (err) {
                return console.log(err);
            };
            if (results.length > 0) {
                resetFrequencies(sessionId)
            } else {
                generateFrequencies(sessionId)
            };
        }
    );
};

// Resets all Frequencies for a session
function resetFrequencies(sessionId) {
    connection.execute("SELECT COUNT(*) AS countBuildings FROM osc_building",
        [],
        function (err, results) {
            if (err) {
                return console.log(err)
            }
            var buildingCount = results[0].countBuildings;

            var maxFrequency = 120;
            var minFrequency = 50;
            for (i = 1; i <= buildingCount; i++) {
                var frequency = Math.floor(Math.random() * (maxFrequency - minFrequency + 1)) + minFrequency;
                connection.execute("UPDATE osc_frequency SET frequency_to_match = ? WHERE frequency_session_id = ? AND frequency_building_id = ?",
                    [frequency,sessionId,i],
                    function (err) {
                        if (err) {
                            return console.log(err);
                        };
                    }
                )
            }
        }
    );
};

module.exports = router;