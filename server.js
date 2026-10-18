const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let timer = 300; // 5 minutes (300 seconds)
let timerInterval = null;
let timerRunning = false;
let groupScores = { "Group 1": 0, "Group 2": 0, "Group 3": 0, "Group 4": 0 };
let groupAnswers = { "Group 1": {}, "Group 2": {}, "Group 3": {}, "Group 4": {} };

const correctAnswers = {
    q1: "RA7277",
    q2: "RA7610",
    q3: "RA8371",
    q4: "CONST",
    q5: "RA7277",
    q6: "RA7610"
};

io.on('connection', (socket) => {
    // Send initial state to newly connected client
    socket.emit('updateState', { groupScores, timer, timerRunning });

    // Handle incoming answer submissions
    socket.on('submitAnswer', ({ groupName, questionId, answer }) => {
        if (timer <= 0) return; // Prevent answering if time is up
        groupAnswers[groupName][questionId] = answer;
        
        // Recalculate score for this group
        let score = 0;
        for (let q in correctAnswers) {
            if (groupAnswers[groupName][q] === correctAnswers[q]) {
                score++;
            }
        }
        groupScores[groupName] = score;

        // Broadcast updated scores to ALL devices instantly
        io.emit('updateState', { groupScores, timer, timerRunning });
    });

    // Control global timer
    socket.on('startTimer', () => {
        if (!timerRunning) {
            timerRunning = true;
            io.emit('timerStarted', { timer, timerRunning });
            
            timerInterval = setInterval(() => {
                if (timer > 0) {
                    timer--;
                    io.emit('timerUpdate', timer);
                } else {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    io.emit('timeUp');
                }
            }, 1000);
        }
    });

    socket.on('resetGame', () => {
        clearInterval(timerInterval);
        timerInterval = null;
        timer = 300;
        timerRunning = false;
        groupScores = { "Group 1": 0, "Group 2": 0, "Group 3": 0, "Group 4": 0 };
        groupAnswers = { "Group 1": {}, "Group 2": {}, "Group 3": {}, "Group 4": {} };
        io.emit('resetState', { groupScores, timer });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});